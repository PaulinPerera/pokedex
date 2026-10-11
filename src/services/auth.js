// Autenticação LOCAL (protótipo): contas ficam no AsyncStorage deste aparelho.
// Senhas nunca são gravadas em texto puro: salt aleatório + SHA-256 iterado (expo-crypto).
// Não é um serviço multiusuário seguro: sem backend não há proteção contra quem tem acesso ao aparelho.
import * as Crypto from 'expo-crypto';
import { CONFIG } from '../config';
import { keys, readJSON, writeJSON } from './storage';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function newSalt() {
  const bytes = Crypto.getRandomBytes(16);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
  let h = `${salt}:${password}`;
  for (let i = 0; i < CONFIG.HASH_ROUNDS; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    h = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, h + salt);
  }
  return h;
}

export const publicProfile = ({ salt, hash, ...rest }) => rest;

async function loadAccounts() {
  return readJSON(keys.accounts, []);
}
const saveAccounts = (list) => writeJSON(keys.accounts, list);

export async function getAccountById(id) {
  const list = await loadAccounts();
  return list.find((a) => a.id === id) || null;
}

function validateIdentity({ username, email }, accounts, selfId) {
  const errors = {};
  const name = (username || '').trim();
  if (!name) errors.username = 'Informe um nome de usuário.';
  else if (name.length < 3) errors.username = 'O nome precisa ter ao menos 3 caracteres.';
  else if (name.length > 20) errors.username = 'O nome pode ter no máximo 20 caracteres.';
  const mail = (email || '').trim().toLowerCase();
  if (!mail) errors.email = 'Informe o e-mail.';
  else if (!EMAIL_RE.test(mail)) errors.email = 'E-mail inválido. Exemplo: ash@pallet.com';
  else if (accounts.some((a) => a.email === mail && a.id !== selfId)) errors.email = 'Este e-mail já está cadastrado.';
  return errors;
}

function validateNewPassword(password, confirm) {
  const errors = {};
  if (!password) errors.password = 'Informe a senha.';
  else if (password.length < CONFIG.PASSWORD_MIN_LENGTH) {
    errors.password = `A senha precisa ter ao menos ${CONFIG.PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (confirm !== undefined) {
    if (!confirm) errors.confirm = 'Confirme a senha.';
    else if (confirm !== password) errors.confirm = 'As senhas não conferem.';
  }
  return errors;
}

  export async function registerAccount({ username, email, password, confirm, avatar, photo }) {
  const accounts = await loadAccounts();
  const errors = { ...validateIdentity({ username, email }, accounts, null), ...validateNewPassword(password, confirm) };
  if (Object.keys(errors).length) return { errors };
  const salt = newSalt();
  const account = {
    id: Crypto.randomUUID(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    avatar: avatar || 'red',
    photo: photo || null,
    createdAt: new Date().toISOString(),
    salt,
    hash: await hashPassword(password, salt),
  };
  await saveAccounts([...accounts, account]);
  return { account };
}

export async function loginAccount({ email, password }) {
  const errors = {};
  const mail = (email || '').trim().toLowerCase();
  if (!mail) errors.email = 'Informe o e-mail.';
  else if (!EMAIL_RE.test(mail)) errors.email = 'E-mail inválido.';
  if (!password) errors.password = 'Informe a senha.';
  if (Object.keys(errors).length) return { errors };
  const accounts = await loadAccounts();
  const account = accounts.find((a) => a.email === mail);
  if (!account) return { errors: { email: 'Nenhuma conta encontrada com este e-mail.' } };
  const h = await hashPassword(password, account.salt);
  if (h !== account.hash) return { errors: { password: 'Senha incorreta.' } };
  return { account };
}

  export async function updateAccount(id, { username, email, avatar, photo }) {
  const accounts = await loadAccounts();
  const errors = validateIdentity({ username, email }, accounts, id);
  if (Object.keys(errors).length) return { errors };
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx < 0) return { errors: { form: 'Conta não encontrada.' } };
    const updated = { ...accounts[idx], username: username.trim(), email: email.trim().toLowerCase(), avatar, photo: photo || null };
  const next = [...accounts];
  next[idx] = updated;
  await saveAccounts(next);
  return { account: updated };
}

export async function changePassword(id, { current, password, confirm }) {
  const accounts = await loadAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx < 0) return { errors: { form: 'Conta não encontrada.' } };
  const errors = validateNewPassword(password, confirm);
  if (!current) errors.current = 'Informe a senha atual.';
  else if ((await hashPassword(current, accounts[idx].salt)) !== accounts[idx].hash) errors.current = 'Senha atual incorreta.';
  if (Object.keys(errors).length) return { errors };
  const salt = newSalt();
  const next = [...accounts];
  next[idx] = { ...accounts[idx], salt, hash: await hashPassword(password, salt) };
  await saveAccounts(next);
  return { ok: true };
}

export async function deleteAccountRecord(id) {
  const accounts = await loadAccounts();
  await saveAccounts(accounts.filter((a) => a.id !== id));
}
