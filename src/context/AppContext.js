import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Appearance } from 'react-native';
import { CONFIG, STARTER_IDS } from '../config';
import { palettes } from '../theme';
import { keys, readJSON, writeJSON, writeMany, removeKeys } from '../services/storage';
import * as Auth from '../services/auth';
import { getDrawPool, getSpecies } from '../services/pokeApi';
import { cleanNickname, createInstance, todayKey } from '../services/collection';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DEFAULT_GAME = { starterDone: false, starterInstanceId: null, lastDraw: null };

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState({
    theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
    animations: true,
  });
  const [profile, setProfile] = useState(null);
  const [pc, setPc] = useState([]);
  const [game, setGame] = useState(DEFAULT_GAME);
  const profileRef = useRef(null);
  const pcRef = useRef([]);
  const gameRef = useRef(DEFAULT_GAME);

  const applyProfile = useCallback((p) => { profileRef.current = p; setProfile(p); }, []);

  const hydrate = useCallback(async (account) => {
    const p = Auth.publicProfile(account);
    const [savedPc, savedGame] = await Promise.all([
      readJSON(keys.pc(p.id), []),
      readJSON(keys.game(p.id), DEFAULT_GAME),
    ]);
    pcRef.current = savedPc; setPc(savedPc);
    gameRef.current = { ...DEFAULT_GAME, ...savedGame }; setGame(gameRef.current);
    applyProfile(p);
  }, [applyProfile]);

  useEffect(() => {
    (async () => {
      const saved = await readJSON(keys.settings, null);
      if (saved) setSettings((s) => ({ ...s, ...saved }));
      const sid = await readJSON(keys.session, null);
      if (sid) {
        const acc = await Auth.getAccountById(sid);
        if (acc) await hydrate(acc);
      }
      setReady(true);
    })();
  }, [hydrate]);

  const updateSettings = useCallback(async (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await writeJSON(keys.settings, next);
  }, [settings]);

  // Grava PC e/ou estado do jogo juntos; só atualiza a memória depois de persistir.
  const commit = useCallback(async (nextPc, nextGame) => {
    const id = profileRef.current.id;
    const entries = [];
    if (nextPc) entries.push([keys.pc(id), nextPc]);
    if (nextGame) entries.push([keys.game(id), nextGame]);
    await writeMany(entries);
    if (nextPc) { pcRef.current = nextPc; setPc(nextPc); }
    if (nextGame) { gameRef.current = nextGame; setGame(nextGame); }
  }, []);

  // ---------- Conta ----------
  const register = useCallback(async (fields) => {
    const res = await Auth.registerAccount(fields);
    if (res.errors) return res;
    await writeJSON(keys.session, res.account.id);
    await hydrate(res.account);
    return { ok: true };
  }, [hydrate]);

  const login = useCallback(async (fields) => {
    const res = await Auth.loginAccount(fields);
    if (res.errors) return res;
    await writeJSON(keys.session, res.account.id);
    await hydrate(res.account);
    return { ok: true };
  }, [hydrate]);

  const resetMemory = useCallback(() => {
    pcRef.current = []; setPc([]);
    gameRef.current = DEFAULT_GAME; setGame(DEFAULT_GAME);
    applyProfile(null);
  }, [applyProfile]);

  const logout = useCallback(async () => {
    await writeJSON(keys.session, null);
    resetMemory();
  }, [resetMemory]);

  const deleteAccount = useCallback(async () => {
    const id = profileRef.current.id;
    await Auth.deleteAccountRecord(id);
    await removeKeys([keys.pc(id), keys.game(id), keys.session]);
    resetMemory();
  }, [resetMemory]);

  const updateProfile = useCallback(async (patch) => {
    const res = await Auth.updateAccount(profileRef.current.id, patch);
    if (res.errors) return res;
    applyProfile(Auth.publicProfile(res.account));
    return { ok: true };
  }, [applyProfile]);

  const changePassword = useCallback((fields) => Auth.changePassword(profileRef.current.id, fields), []);

  // ---------- Coleção ----------
  const chooseStarter = useCallback(async (speciesId, nickname) => {
    if (gameRef.current.starterDone) throw new Error('O inicial já foi escolhido.');
    if (!STARTER_IDS.includes(speciesId)) throw new Error('Esta espécie não é um inicial disponível.');
    const inst = createInstance(getSpecies(speciesId), { origin: 'inicial', nickname, allowShiny: false });
    await commit([...pcRef.current, inst], { ...gameRef.current, starterDone: true, starterInstanceId: inst.instanceId });
    return inst;
  }, [commit]);

  // O resultado é gerado e gravado na hora (bloqueia novo sorteio hoje e não muda ao reabrir o app).
  const rollDaily = useCallback(async () => {
    const g = gameRef.current;
    if (g.lastDraw && g.lastDraw.pending) return g.lastDraw.pending;
    if (!CONFIG.DEV_UNLIMITED_DRAWS && g.lastDraw && g.lastDraw.date === todayKey()) {
      throw new Error('Você já fez o sorteio de hoje.');
    }
    const pool = getDrawPool();
    const species = pool[Math.floor(Math.random() * pool.length)];
    const inst = createInstance(species, { origin: 'randomizador', allowShiny: true });
    await commit(null, { ...g, lastDraw: { date: todayKey(), instanceId: inst.instanceId, pending: inst } });
    return inst;
  }, [commit]);

  const finalizeDaily = useCallback(async (nickname) => {
    const g = gameRef.current;
    const pending = g.lastDraw && g.lastDraw.pending;
    if (!pending) throw new Error('Não há sorteio pendente.');
    const inst = { ...pending, nickname: cleanNickname(nickname) };
    await commit([...pcRef.current, inst], {
      ...g, lastDraw: { date: g.lastDraw.date, instanceId: inst.instanceId, pending: null },
    });
    return inst;
  }, [commit]);

  const renameInstance = useCallback(async (instanceId, nickname) => {
    const next = pcRef.current.map((p) => (p.instanceId === instanceId ? { ...p, nickname: cleanNickname(nickname) } : p));
    await commit(next, null);
  }, [commit]);

  const colors = palettes[settings.theme] || palettes.light;

  const value = useMemo(() => ({
    ready, settings, colors, profile, pc, game,
    updateSettings, register, login, logout, deleteAccount, updateProfile, changePassword,
    chooseStarter, rollDaily, finalizeDaily, renameInstance,
  }), [ready, settings, colors, profile, pc, game, updateSettings, register, login, logout,
    deleteAccount, updateProfile, changePassword, chooseStarter, rollDaily, finalizeDaily, renameInstance]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
