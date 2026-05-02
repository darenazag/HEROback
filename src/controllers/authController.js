import * as authService from '../services/authService.js';

/** POST /api/auth/register */
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password)
            return res.status(400).json({ error: 'username, email y password son obligatorios' });
        if (password.length < 6)
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        const user = await authService.register({ username, email, password });
        return res.status(201).json({ message: 'Usuario registrado correctamente', user });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

/** POST /api/auth/login */
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'email y password son obligatorios' });
        const result = await authService.login({ email, password });
        return res.status(200).json(result);
    } catch (err) {
        return res.status(401).json({ error: err.message });
    }
}

/** GET /api/auth/me */
export async function me(req, res) {
    try {
        const user = await authService.getProfile(req.user.id);
        return res.status(200).json(user);
    } catch (err) {
        return res.status(404).json({ error: err.message });
    }
}

export const functions = { register, login, me };

export default functions;