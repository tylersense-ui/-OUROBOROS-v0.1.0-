/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.0 🐍                       ║
 * ║      Operator Logger - Les Actions de l'Architecte        ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/log-action.js
 * @version     0.1.0
 * @author      Claude (Godlike AI Operator)
 * @description Logger actions manuelles de l'opérateur
 * 
 * USAGE:
 *   run /tools/log-action.js "Achat NeuroFlux x5 pour $500m"
 *   run /tools/log-action.js "Rejoint faction Daedalus" --debug 2
 *   run /tools/log-action.js "Reset avec 30 augs"
 * 
 * FEATURES:
 *   ✅ Historique 100 dernières actions
 *   ✅ Timestamp + contexte (money, hacking)
 *   ✅ Validation input
 *   ✅ Toast confirmation
 * 
 * ARGUMENTS:
 *   <action>    : Description de l'action (requis)
 *   --debug <N> : Debug level 0-3 (optionnel)
 * 
 * CHANGELOG:
 *   v0.1.0 - 2025-01-XX - OUROBOROS initial release
 *          - Import Debug system
 *          - Validation input
 *          - Toast feedback
 *          - Header ASCII art complet
 */

import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

/** @param {NS} ns */
export async function main(ns) {
    // ══════════════════════════════════════════════════════════════
    // SETUP
    // ══════════════════════════════════════════════════════════════
    
    ns.disableLog("ALL");
    ns.tail();
    
    const debugLevel = parseDebugLevel(ns);
    const dbg = new Debug(ns, debugLevel);
    const stateMgr = new StateManager(ns, debugLevel);
    
    dbg.header("OPERATOR ACTION LOGGER v0.1.0");
    
    // ══════════════════════════════════════════════════════════════
    // VALIDATION INPUT
    // ══════════════════════════════════════════════════════════════
    
    // Filtrer args sans --debug
    const actionArgs = ns.args.filter((arg, i) => {
        if (arg === "--debug") return false;
        if (i > 0 && ns.args[i-1] === "--debug") return false;
        return true;
    });
    
    if (actionArgs.length === 0) {
        dbg.error("Missing action description");
        ns.tprint(`${ICONS.ERROR} USAGE: run /tools/log-action.js "Action description"`);
        ns.tprint(`${ICONS.INFO} Example: run /tools/log-action.js "Bought NeuroFlux x5"`);
        return;
    }
    
    const action = actionArgs.join(" ").trim();
    
    // Validation: action non vide après trim
    if (action === "") {
        dbg.error("Empty action description");
        dbg.toastError("Action cannot be empty");
        return;
    }
    
    dbg.normal(`${ICONS.INFO} Logging action: "${action}"`);
    
    // ══════════════════════════════════════════════════════════════
    // LOAD HISTORY
    // ══════════════════════════════════════════════════════════════
    
    let history = stateMgr.load("operator-actions.json");
    
    if (!history || !Array.isArray(history.actions)) {
        dbg.verbose(`${ICONS.INFO} Creating new actions history`);
        history = {
            version: "0.1.0",
            created: new Date().toISOString(),
            actions: []
        };
    }
    
    dbg.verbose(`${ICONS.CHART} Current history: ${history.actions.length} actions`);
    
    // ══════════════════════════════════════════════════════════════
    // CREATE ENTRY
    // ══════════════════════════════════════════════════════════════
    
    const entry = {
        timestamp: new Date().toISOString(),
        action: action,
        context: {
            money: ns.getServerMoneyAvailable("home"),
            hackingLevel: ns.getHackingLevel(),
            homeRam: ns.getServerMaxRam("home"),
            timeSinceAug: ns.getTimeSinceLastAug()
        }
    };
    
    history.actions.push(entry);
    
    dbg.verbose(`${ICONS.SUCCESS} Entry created:`);
    dbg.verbose(`  Money: $${ns.formatNumber(entry.context.money)}`);
    dbg.verbose(`  Hacking: ${entry.context.hackingLevel}`);
    
    // ══════════════════════════════════════════════════════════════
    // TRIM HISTORY (keep last 100)
    // ══════════════════════════════════════════════════════════════
    
    if (history.actions.length > 100) {
        const removed = history.actions.length - 100;
        history.actions = history.actions.slice(-100);
        dbg.verbose(`${ICONS.INFO} Trimmed ${removed} old entries (keeping 100)`);
    }
    
    // ══════════════════════════════════════════════════════════════
    // SAVE
    // ══════════════════════════════════════════════════════════════
    
    const success = await stateMgr.save("operator-actions.json", history);
    
    if (success) {
        dbg.success("Action logged successfully");
        dbg.toastSuccess(`Logged: ${action}`);
        
        ns.tprint(`${ICONS.SUCCESS} Action logged: ${action}`);
        ns.tprint(`${ICONS.CHART} Total actions in history: ${history.actions.length}`);
    } else {
        dbg.error("Failed to save action");
        dbg.toastError("Failed to save action");
    }
    
    dbg.separator();
    dbg.normal(`${ICONS.SNAKE} OUROBOROS remembers all`, ICONS.EYE);
}
