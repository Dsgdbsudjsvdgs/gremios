import { supabase } from '../lib/supabaseClient.js'

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) return null
    return user
}

export async function checkAuth() {
    const user = await getCurrentUser()
    if (!user) {
        window.location.href = '../login.html'
    }
    return user
}

export async function getEmailByCpf(cpf) {
    const { data, error } = await supabase
        .from('membros')
        .select('email')
        .eq('cpf', cpf)
        .single()

    if (error || !data) throw new Error('CPF não encontrado ou não vinculado a nenhuma conta.')
    return data.email
}

export async function signInWithCpf(cpf, password) {
    try {
        const email = await getEmailByCpf(cpf)
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    } catch (error) {
        throw error
    }
}

export async function signUp(email, password, full_name, cpf) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: full_name,
                cpf: cpf
            }
        }
    })
    if (error) throw error
    return data
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    window.location.href = '../login.html'
}
