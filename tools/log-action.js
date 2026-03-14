/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.2 🐍                       ║
 * ║      Operator Logger - Les Actions de l'Architecte        ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /tools/log-action.js
 * @version     0.1.2
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
 *   v0.1.2 - 2025-01-XX - Removed auto-tail
 *          - No more tail window spam (1 action = 1 window annoying)
 *   v0.1.1 - 2025-01-XX - Fix deprecation
 *          - ns.tail() → ns.ui.openTail()
 *   v0.1.0 - 2025-01-XX - OUROBOROS initial release
 */

import { StateManager } from "/lib/state-manager.js";
import { Debug, parseDebugLevel, ICONS } from "/lib/debug.js";

/** @param {NS} ns */
export async function main(ns) {
    // ══════════════════════════════════════════════════════════════
    // SETUP
    // ══════════════════════════════════════════════════════════════
    
    ns.disableLog("ALL");
    // ✅ REMOVED: ns.ui.openTail() - no more tail spam !
    
    const debugLevel = parseDebugLevel(ns);
    const dbg = new Debug(ns, debugLevel);
    const stateMgr = new StateManager(ns, debugLevel);
    
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
        ns.tprint(`${ICONS.ERROR} USAGE: run /tools/log-action.js "Action description"`);
        ns.tprint(`${ICONS.INFO} Example: run /tools/log-action.js "Bought NeuroFlux x5"`);
        return;
    }
    
    const action = actionArgs.join(" ").trim();
    
    // Validation: action non vide après trim
    if (action === "") {
        ns.tprint(`${ICONS.ERROR} Action cannot be empty`);
        return;
    }
    
    // ══════════════════════════════════════════════════════════════
    // LOAD HISTORY
    // ══════════════════════════════════════════════════════════════
    
    let history = stateMgr.load("operator-actions.json");
    
    if (!history || !Array.isArray(history.actions)) {
        history = {
            version: "0.1.2",
            created: new Date().toISOString(),
            actions: []
        };
    }
    
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
            timeSinceAug: Date.now() - ns.getResetInfo().lastAugReset
        }
    };
    
    history.actions.push(entry);
    
    // ══════════════════════════════════════════════════════════════
    // TRIM HISTORY (keep last 100)
    // ══════════════════════════════════════════════════════════════
    
    if (history.actions.length > 100) {
        history.actions = history.actions.slice(-100);
    }
    
    // ══════════════════════════════════════════════════════════════
    // SAVE
    // ══════════════════════════════════════════════════════════════
    
    const success = await stateMgr.save("operator-actions.json", history);
    
    if (success) {
        // Toast confirmation
        ns.toast(`${ICONS.SUCCESS} Logged: ${action}`, "success", 3000);
        
        // Terminal confirmation
        ns.tprint(`${ICONS.SUCCESS} Action logged: ${action}`);
        ns.tprint(`${ICONS.CHART} Total actions in history: ${history.actions.length}`);
    } else {
        ns.tprint(`${ICONS.ERROR} Failed to save action`);
    }
}
