/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.0 🐍                       ║
 * ║        State Manager - La Mémoire du Serpent              ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /lib/state-manager.js
 * @version     0.1.0
 * @author      Claude (Godlike AI Operator)
 * @description API unifiée pour persistence état dans /state/
 * 
 * USAGE:
 *   import { StateManager } from "/lib/state-manager.js";
 *   const state = new StateManager(ns);
 *   await state.save("data.json", { key: "value" });
 *   const data = state.load("data.json");
 * 
 * FEATURES:
 *   ✅ Création auto dossier /state/
 *   ✅ Validation JSON avant save
 *   ✅ Backup/restore snapshots
 *   ✅ Update partiel (merge)
 *   ✅ Cleanup par age
 *   ✅ Append logs
 * 
 * CHANGELOG:
 *   v0.1.0 - 2025-01-XX - OUROBOROS initial release
 *          - Auto-création /state/
 *          - Validation JSON
 *          - Méthodes update() et backup()
 */

import { Debug, ICONS } from "/lib/debug.js";

// ══════════════════════════════════════════════════════════════
// STATE MANAGER CLASS
// ══════════════════════════════════════════════════════════════

export class StateManager {
    /**
     * @param {NS} ns - NetScript instance
     * @param {number} debugLevel - Debug level (0-3)
     */
    constructor(ns, debugLevel = 0) {
        this.ns = ns;
        this.stateDir = "/state";
        this.dbg = new Debug(ns, debugLevel);
        
        // Créer /state/ si n'existe pas
        this.ensureStateDirExists();
    }
    
    // ══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Créer dossier /state/ si nécessaire
     */
    ensureStateDirExists() {
        try {
            // Tester si /state/ accessible en listant
            const files = this.ns.ls("home", this.stateDir);
            this.dbg.ultra(`${ICONS.SUCCESS} /state/ exists (${files.length} files)`);
        } catch (error) {
            // Dossier n'existe pas, créer via write dummy
            this.dbg.verbose(`${ICONS.INFO} Creating /state/ directory...`);
            this.ns.write(`${this.stateDir}/.keep`, "", "w");
            this.dbg.success("/state/ created");
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // CORE METHODS
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Sauvegarder données dans /state/
     * @param {string} filename - Nom du fichier (ex: "telemetry.json")
     * @param {any} data - Données à sauvegarder
     * @returns {Promise<boolean>} Succès
     */
    async save(filename, data) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            
            // Validation: vérifier que data est sérialisable
            let content;
            if (typeof data === 'string') {
                content = data;
            } else {
                // Valider JSON avant stringify
                try {
                    content = JSON.stringify(data, null, 2);
                } catch (jsonError) {
                    this.dbg.error(`JSON stringify failed for ${filename}: ${jsonError}`);
                    return false;
                }
            }
            
            // Écrire le fichier
            await this.ns.write(filepath, content, "w");
            
            this.dbg.ultra(`${ICONS.SUCCESS} Saved: ${filepath} (${content.length} bytes)`);
            return true;
            
        } catch (error) {
            this.dbg.error(`StateManager.save(${filename}): ${error}`);
            return false;
        }
    }
    
    /**
     * Charger données depuis /state/
     * @param {string} filename - Nom du fichier
     * @param {boolean} parseJSON - Parser en JSON ? (default: true)
     * @returns {any|null} Données ou null si erreur
     */
    load(filename, parseJSON = true) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            
            // Vérifier existence
            if (!this.ns.fileExists(filepath)) {
                this.dbg.verbose(`${ICONS.WARNING} File not found: ${filepath}`);
                return null;
            }
            
            // Lire le fichier
            const content = this.ns.read(filepath);
            
            if (!content || content === "") {
                this.dbg.verbose(`${ICONS.WARNING} Empty file: ${filepath}`);
                return null;
            }
            
            // Parser JSON si demandé
            if (parseJSON) {
                try {
                    const parsed = JSON.parse(content);
                    this.dbg.ultra(`${ICONS.SUCCESS} Loaded: ${filepath}`);
                    return parsed;
                } catch (jsonError) {
                    this.dbg.warn(`JSON parse failed for ${filename}, returning raw string`);
                    return content; // Retourner string brute
                }
            }
            
            this.dbg.ultra(`${ICONS.SUCCESS} Loaded (raw): ${filepath}`);
            return content;
            
        } catch (error) {
            this.dbg.error(`StateManager.load(${filename}): ${error}`);
            return null;
        }
    }
    
    /**
     * Mettre à jour partiellement un fichier JSON (merge)
     * @param {string} filename - Nom du fichier
     * @param {object} updates - Données à merger
     * @returns {Promise<boolean>} Succès
     */
    async update(filename, updates) {
        try {
            // Charger existant
            let current = this.load(filename);
            
            if (!current || typeof current !== 'object') {
                current = {};
            }
            
            // Merger updates
            const merged = { ...current, ...updates };
            
            // Sauvegarder
            return await this.save(filename, merged);
            
        } catch (error) {
            this.dbg.error(`StateManager.update(${filename}): ${error}`);
            return false;
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // FILE OPERATIONS
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Vérifier existence fichier
     * @param {string} filename - Nom du fichier
     * @returns {boolean}
     */
    exists(filename) {
        const filepath = `${this.stateDir}/${filename}`;
        return this.ns.fileExists(filepath);
    }
    
    /**
     * Supprimer fichier
     * @param {string} filename - Nom du fichier
     * @returns {boolean}
     */
    delete(filename) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            const success = this.ns.rm(filepath);
            
            if (success) {
                this.dbg.verbose(`${ICONS.SUCCESS} Deleted: ${filepath}`);
            } else {
                this.dbg.warn(`Failed to delete: ${filepath}`);
            }
            
            return success;
        } catch (error) {
            this.dbg.error(`StateManager.delete(${filename}): ${error}`);
            return false;
        }
    }
    
    /**
     * Lister tous les fichiers /state/
     * @returns {Array<string>} Liste des fichiers
     */
    list() {
        try {
            const files = this.ns.ls("home", this.stateDir);
            this.dbg.ultra(`${ICONS.INFO} Listed ${files.length} files in /state/`);
            return files;
        } catch (error) {
            this.dbg.error(`StateManager.list(): ${error}`);
            return [];
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // BACKUP & RESTORE
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Créer backup d'un fichier
     * @param {string} filename - Fichier à backup
     * @returns {Promise<string|null>} Nom du backup ou null
     */
    async backup(filename) {
        try {
            const data = this.load(filename);
            
            if (!data) {
                this.dbg.warn(`Cannot backup ${filename}: file not found`);
                return null;
            }
            
            // Générer nom backup avec timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const backupName = `${filename}.backup-${timestamp}`;
            
            const success = await this.save(backupName, data);
            
            if (success) {
                this.dbg.success(`Backup created: ${backupName}`);
                return backupName;
            }
            
            return null;
            
        } catch (error) {
            this.dbg.error(`StateManager.backup(${filename}): ${error}`);
            return null;
        }
    }
    
    /**
     * Restaurer depuis backup
     * @param {string} backupFilename - Nom du fichier backup
     * @param {string} targetFilename - Nom du fichier cible
     * @returns {Promise<boolean>} Succès
     */
    async restore(backupFilename, targetFilename) {
        try {
            const data = this.load(backupFilename);
            
            if (!data) {
                this.dbg.warn(`Cannot restore: backup ${backupFilename} not found`);
                return false;
            }
            
            const success = await this.save(targetFilename, data);
            
            if (success) {
                this.dbg.success(`Restored ${targetFilename} from ${backupFilename}`);
            }
            
            return success;
            
        } catch (error) {
            this.dbg.error(`StateManager.restore(): ${error}`);
            return false;
        }
    }
    
    // ══════════════════════════════════════════════════════════════
    // MAINTENANCE
    // ══════════════════════════════════════════════════════════════
    
    /**
     * Nettoyer vieux fichiers (age > maxAge ms)
     * @param {number} maxAge - Age maximum en ms (default: 24h)
     * @returns {number} Nombre de fichiers supprimés
     */
    cleanup(maxAge = 86400000) {
        try {
            const files = this.list();
            let deleted = 0;
            const now = Date.now();
            
            for (const filepath of files) {
                // Extraire filename depuis path complet
                const filename = filepath.replace(this.stateDir + "/", "");
                
                // Charger pour vérifier timestamp
                const data = this.load(filename);
                
                if (data && data.timestamp) {
                    const fileTime = new Date(data.timestamp).getTime();
                    const age = now - fileTime;
                    
                    if (age > maxAge) {
                        if (this.delete(filename)) {
                            deleted++;
                        }
                    }
                }
            }
            
            if (deleted > 0) {
                this.dbg.success(`Cleanup: deleted ${deleted} old files`);
            }
            
            return deleted;
            
        } catch (error) {
            this.dbg.error(`StateManager.cleanup(): ${error}`);
            return 0;
        }
    }
    
    /**
     * Append à un fichier log (.txt)
     * @param {string} filename - Nom du fichier log
     * @param {string} message - Message à ajouter
     * @returns {Promise<boolean>}
     */
    async append(filename, message) {
        try {
            const filepath = `${this.stateDir}/${filename}`;
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] ${message}\n`;
            
            await this.ns.write(filepath, line, "a");
            
            this.dbg.ultra(`${ICONS.SUCCESS} Appended to ${filename}`);
            return true;
            
        } catch (error) {
            this.dbg.error(`StateManager.append(${filename}): ${error}`);
            return false;
        }
    }
}
