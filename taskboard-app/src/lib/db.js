/**
 * db.js — Friction OS data layer
 * All reads/writes go through Supabase.
 * Falls back to localStorage if offline.
 * Real-time subscriptions via Supabase Realtime.
 */
import { supabase } from './supabase.js'

// ── TASKS ────────────────────────────────────────────────────────────

export async function fetchTasks() {
  const { data, error } = await supabase
    .from('friction_tasks')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('fetchTasks:', error); return null }
  return data
}

export async function upsertTask(task) {
  const { data, error } = await supabase
    .from('friction_tasks')
    .upsert({ ...task, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single()
  if (error) console.error('upsertTask:', error)
  return data
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from('friction_tasks')
    .delete()
    .eq('id', id)
  if (error) console.error('deleteTask:', error)
}

export function subscribeToTasks(callback) {
  const channel = supabase
    .channel('friction_tasks_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'friction_tasks' },
      () => { fetchTasks().then(tasks => { if (tasks) callback(tasks) }) }
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ── KPI / SHS ────────────────────────────────────────────────────────

export async function fetchKpi() {
  const { data, error } = await supabase
    .from('friction_kpi')
    .select('*')
    .order('ts', { ascending: true })
  if (error) { console.error('fetchKpi:', error); return [] }
  return data || []
}

export async function insertKpi(entry) {
  const { data, error } = await supabase
    .from('friction_kpi')
    .insert(entry)
    .select()
    .single()
  if (error) console.error('insertKpi:', error)
  return data
}

export async function deleteKpi(id) {
  const { error } = await supabase
    .from('friction_kpi')
    .delete()
    .eq('id', id)
  if (error) console.error('deleteKpi:', error)
}

// ── CLIENTS ──────────────────────────────────────────────────────────

export async function fetchClients() {
  const { data, error } = await supabase
    .from('friction_clients')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) { console.error('fetchClients:', error); return [] }
  return data || []
}

export async function upsertClient(client) {
  const { data, error } = await supabase
    .from('friction_clients')
    .upsert(client, { onConflict: 'id' })
    .select()
    .single()
  if (error) console.error('upsertClient:', error)
  return data
}

export async function deleteClient(id) {
  const { error } = await supabase
    .from('friction_clients')
    .delete()
    .eq('id', id)
  if (error) console.error('deleteClient:', error)
}

// ── INVOICES ─────────────────────────────────────────────────────────

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('friction_invoices')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchInvoices:', error); return [] }
  return data || []
}

export async function insertInvoice(invoice) {
  const { data, error } = await supabase
    .from('friction_invoices')
    .insert(invoice)
    .select()
    .single()
  if (error) console.error('insertInvoice:', error)
  return data
}

export async function updateInvoiceStatus(id, status) {
  const { error } = await supabase
    .from('friction_invoices')
    .update({ status })
    .eq('id', id)
  if (error) console.error('updateInvoiceStatus:', error)
}

export async function deleteInvoice(id) {
  const { error } = await supabase
    .from('friction_invoices')
    .delete()
    .eq('id', id)
  if (error) console.error('deleteInvoice:', error)
}
