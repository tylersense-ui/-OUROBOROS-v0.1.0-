/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.0 🐍                       ║
 * ║          Debug System - Le Regard du Serpent              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/debug.js
 * @version     0.1.0
 * @author      Claude (Godlike AI Operator)
 * @description Système de debug réutilisable multi-niveaux
 * 
 * USAGE:
 *   import { Debug } from "/lib/debug.js";
 *   const dbg = new Debug(ns, debugLevel);
 *   dbg.log("Message normal", 1);
 *   dbg.toastSuccess("Opération réussie");
 * 
 * DEBUG LEVELS:
 *   0 = SILENT   : Toasts succès uniquement
 *   1 = NORMAL   : Infos importantes (défaut)
 *   2 = VERBOSE  : Détails + metrics + timing
 *   3 = ULTRA    : Debug complet
 * 
 * CHANGELOG:
 *   v0.1.0 - 2025-01-XX - Création initiale OUROBOROS
 */

// ══════════════════════════════════════════════════════════════
// DEBUG LEVELS CONSTANTS
// ══════════════════════════════════════════════════════════════

export const DEBUG_SILENT = 0;
export const DEBUG_NORMAL = 1;
export const DEBUG_VERBOSE = 2;
export const DEBUG_ULTRA = 3;

// ══════════════════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════════════════

export const ICONS = {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    MONEY: "💰",
    NETWORK: "🌐",
    SPEED: "⚡",
    LOCK: "🔒",
    TARGET: "🎯",
    ROCKET: "🚀",
    SNAKE: "🐍",
    EYE: "👁️",
    CHART: "📊",
    TIMER: "⏱️",
    BRAIN: "🧠",
    FIRE: "🔥"
};

// ══════════════════════════════════════════════════════════════
// DEBUG CLASS
// ══════════════════════════════════════════════════════════════

export class Debug {
    /**
     * @param {NS} ns - NetScript instance
     * @param {number} level - Debug level (0-3)
     */
    constructor(ns, level = DEBUG_NORMAL) {
        this.ns = ns;
        this.level = level;
        this.timers = new Map();
        
        // Auto-tail si verbose ou ultra
        if (this.level >= DEBUG_VERBOSE) {
            this.ns.tail();
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // CORE LOGGING
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Log message si level suffisant
     * @param {string} message - Message à logger
     * @param {number} minLevel - Level minimum requis
     * @param {string} icon - Icône optionnelle
     */
    log(message, minLevel = DEBUG_NORMAL, icon = "") {
        if (this.level >= minLevel) {
            const prefix = icon ? `${icon} ` : "";
            this.ns.print(`${prefix}${message}`);
        }
    }
    
    /**
     * Log pour DEBUG_NORMAL
     * @param {string} message
     * @param {string} icon
     */
    normal(message, icon = ICONS.INFO) {
        this.log(message, DEBUG_NORMAL, icon);
    }
    
    /**
     * Log pour DEBUG_VERBOSE
     * @param {string} message
     * @param {string} icon
     */
    verbose(message, icon = ICONS.INFO) {
        this.log(message, DEBUG_VERBOSE, icon);
    }
    
    /**
     * Log pour DEBUG_ULTRA
     * @param {string} message
     * @param {string} icon
     */
    ultra(message, icon = ICONS.BRAIN) {
        this.log(message, DEBUG_ULTRA, icon);
    }
    
    /**
     * Log erreur (toujours affiché)
     * @param {string} message
     */
    error(message) {
        this.ns.print(`${ICONS.ERROR} ERROR: ${message}`);
        this.ns.tprint(`${ICONS.ERROR} ERROR: ${message}`);
    }
    
    /**
     * Log warning
     * @param {string} message
     */
    warn(message) {
        this.log(`${ICONS.WARNING} WARNING: ${message}`, DEBUG_NORMAL);
    }
    
    /**
     * Log succès
     * @param {string} message
     */
    success(message) {
        this.log(`${ICONS.SUCCESS} ${message}`, DEBUG_NORMAL);
    }
    
    // ══════════════════════════════════════════════════════════════
    // TOASTS
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Toast succès
     * @param {string} message
     */
    toastSuccess(message) {
        this.ns.toast(`${ICONS.SUCCESS} ${message}`, "success", 3000);
    }
    
    /**
     * Toast erreur
     * @param {string} message
     */
    toastError(message) {
        this.ns.toast(`${ICONS.ERROR} ${message}`, "error", 5000);
    }
    
    /**
     * Toast warning
     * @param {string} message
     */
    toastWarning(message) {
        this.ns.toast(`${ICONS.WARNING} ${message}`, "warning", 4000);
    }
    
    /**
     * Toast info
     * @param {string} message
     */
    toastInfo(message) {
        this.ns.toast(`${ICONS.INFO} ${message}`, "info", 3000);
    }
    
    // ══════════════════════════════════════════════════════════════
    // TIMING
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Démarrer un timer
     * @param {string} name - Nom du timer
     */
    startTimer(name) {
        this.timers.set(name, Date.now());
        this.ultra(`${ICONS.TIMER} Timer started: ${name}`);
    }
    
    /**
     * Arrêter un timer et afficher durée
     * @param {string} name - Nom du timer
     * @returns {number} Durée en ms
     */
    endTimer(name) {
        if (!this.timers.has(name)) {
            this.warn(`Timer ${name} not found`);
            return 0;
        }
        
        const start = this.timers.get(name);
        const duration = Date.now() - start;
        this.timers.delete(name);
        
        this.verbose(`${ICONS.TIMER} ${name}: ${duration}ms`);
        return duration;
    }
    
    // ══════════════════════════════════════════════════════════════
    // METRICS DISPLAY
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Afficher montant formaté
     * @param {string} label
     * @param {number} amount
     */
    money(label, amount) {
        this.log(`${ICONS.MONEY} ${label}: $${this.ns.formatNumber(amount)}`, DEBUG_NORMAL);
    }
    
    /**
     * Afficher métrique générique
     * @param {string} label
     * @param {number} value
     * @param {string} unit
     */
    metric(label, value, unit = "") {
        const formatted = this.ns.formatNumber(value);
        this.log(`${ICONS.CHART} ${label}: ${formatted}${unit}`, DEBUG_NORMAL);
    }
    
    // ══════════════════════════════════════════════════════════════
    // DISPLAY HELPERS
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Afficher header
     * @param {string} title
     */
    header(title) {
        if (this.level >= DEBUG_NORMAL) {
            this.ns.print("╔═══════════════════════════════════════════════════════════╗");
            this.ns.print(`║ ${ICONS.SNAKE} ${title.padEnd(55)} ║`);
            this.ns.print("╚═══════════════════════════════════════════════════════════╝");
        }
    }
    
    /**
     * Afficher séparateur
     */
    separator() {
        if (this.level >= DEBUG_VERBOSE) {
            this.ns.print("─────────────────────────────────────────────────────────────");
        }
    }
    
    /**
     * Clear log
     */
    clear() {
        this.ns.clearLog();
    }
    
    // ══════════════════════════════════════════════════════════════
    // UTILITIES
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Vérifier si level actif
     * @param {number} minLevel
     * @returns {boolean}
     */
    isLevel(minLevel) {
        return this.level >= minLevel;
    }
    
    /**
     * Obtenir level actuel
     * @returns {number}
     */
    getLevel() {
        return this.level;
    }
    
    /**
     * Changer level
     * @param {number} newLevel
     */
    setLevel(newLevel) {
        this.level = Math.max(0, Math.min(3, newLevel));
        this.normal(`Debug level changed to ${this.level}`);
    }
}

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (standalone)
// ══════════════════════════════════════════════════════════════

/**
 * Parser argument --debug depuis ns.args
 * @param {NS} ns
 * @returns {number} Debug level (0-3)
 */
export function parseDebugLevel(ns) {
    const debugIndex = ns.args.indexOf("--debug");
    
    if (debugIndex === -1) {
        return DEBUG_NORMAL; // Default
    }
    
    // Vérifier si valeur fournie après --debug
    if (debugIndex + 1 >= ns.args.length) {
        return DEBUG_NORMAL;
    }
    
    const level = parseInt(ns.args[debugIndex + 1]);
    
    if (isNaN(level)) {
        return DEBUG_NORMAL;
    }
    
    // Clamp entre 0-3
    return Math.max(0, Math.min(3, level));
}
