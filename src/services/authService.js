import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Registra un nuevo usuario en la BD.
 * @param {{ username:string, email:string, password:string }} data
 * @returns {Promise<object>} Usuario creado sin password_hash
 */
export async function register({ username, email, password }) {
    if (await User.findOne({ where: { email } }))
        throw new Error('El email ya está registrado');
    if (await User.findOne({ where: { username } }))
        throw new Error('El nombre de usuario ya está en uso');

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password_hash });
    const { password_hash: _, ...safe } = user.toJSON();
    return safe;
}

/**
 * Valida credenciales y devuelve un JWT firmado.
 * @param {{ email:string, password:string }} data
 * @returns {Promise<{ token:string, user:object }>}
 */
export async function login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Credenciales incorrectas');

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    const { password_hash: _, ...safe } = user.toJSON();
    return { token, user: safe };
}

/**
 * Devuelve el perfil del usuario sin exponer el hash.
 * @param {number} userId
 * @returns {Promise<User>}
 */
export async function getProfile(userId) {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] },
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
}

export default { register, login, getProfile };
