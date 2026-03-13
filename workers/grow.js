/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.1 🐍                       ║
 * ║          Worker Grow - La Croissance du Serpent           ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /workers/grow.js
 * @version     0.1.1
 * @author      Claude (Godlike AI Operator)
 * @description Worker minimaliste pour grow (1.75GB RAM)
 * 
 * USAGE:
 *   exec("/workers/grow.js", server, threads, target)
 * 
 * ARGUMENTS:
 *   target : Hostname du serveur à grow
 * 
 * CHANGELOG:
 *   v0.1.1 - 2025-01-XX - Création initiale
 */

/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0];
    
    if (!target) {
        ns.tprint("ERROR: Missing target argument");
        return;
    }
    
    await ns.grow(target);
}
