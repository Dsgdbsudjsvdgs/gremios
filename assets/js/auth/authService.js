     1|import { supabase } from '../lib/supabaseClient.js'
     2|
     3|export async function getCurrentUser() {
     4|    const { data: { user }, error } = await supabase.auth.getUser()
     5|    if (error) return null
     6|    return user
     7|}
     8|
     9|export async function checkAuth() {
    10|    const user = await getCurrentUser()
    11|    if (!user) {
    12|        window.location.href = '../login.html'
    13|    }
    14|    return user
    15|}
    16|
    17|export async function getEmailByCpf(cpf) {
    18|    const { data, error } = await supabase
    19|        .from('membros')
    20|        .select('email')
    21|        .eq('cpf', cpf)
    22|        .single()
    23|
    24|    if (error || !data) throw new Error('CPF não encontrado ou não vinculado a nenhuma conta.')
    25|    return data.email
    26|}
    27|
    28|export async function signInWithCpf(cpf, password) {
    29|    try {
    30|        const email = await getEmailByCpf(cpf)
    31|        const { data, error } = await supabase.auth.signInWithPassword({
    32|            email,
    33|            password,
    34|        })
    35|        if (error) throw error
    36|        return data
    37|    } catch (error) {
    38|        throw error
    39|    }
    40|}
    41|
    42|export async function signUp(email, password, full_name, cpf) {
    43|    const { data, error } = await supabase.auth.signUp({
    44|        email,
    45|        password,
    46|        options: {
    47|            data: {
    48|                full_name: full_name,
    49|                cpf: cpf
    50|            }
    51|        }
    52|    })
    53|    if (error) throw error
    54|    return data
    55|}
    56|
    57|export async function signOut() {
    58|    const { error } = await supabase.auth.signOut()
    59|    if (error) throw error
    60|    window.location.href = '../login.html'
    61|}
    62|