/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.1.1 🐍                       ║
 * ║        Deploy Script - Déploiement Automatique            ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        deploy-ouroboros-v0.1.1.js
 * @version     0.1.1
 * @author      Claude (Godlike AI Operator)
 * @description Déploie OUROBOROS v0.1.1 depuis GitHub vers Bitburner
 * 
 * USAGE:
 *   1. wget https://raw.githubusercontent.com/tylersense-ui/-OUROBOROS-v0.1.0-/main/deploy-ouroboros-v0.1.1.js deploy.js
 *   2. run deploy.js
 * 
 * ACTIONS:
 *   ✅ Crée structure dossiers
 *   ✅ Télécharge tous les fichiers v0.1.1
 *   ✅ Vérifie intégrité
 *   ✅ Rapport détaillé
 * 
 * CHANGELOG:
 *   v0.1.1 - 2025-01-XX - Ajout workers/, core/, CHANGELOG
 *   v0.1.0 - 2025-01-XX - Création initiale
 */

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.ui.openTail();
    
    // ══════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ══════════════════════════════════════════════════════════════
    
    const GITHUB_USER = "tylersense-ui";
    const REPO_NAME = "-OUROBOROS-v0.1.0-";
    const BRANCH = "main";
    const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${REPO_NAME}/${BRANCH}`;
    
    // Liste des fichiers à télécharger (v0.1.1)
    const FILES = [
        // Libraries
        { path: "/lib/debug.js", required: true },
        { path: "/lib/state-manager.js", required: true },
        
        // Workers (NOUVEAUX v0.1.1)
        { path: "/workers/hack.js", required: true },
        { path: "/workers/grow.js", required: true },
        { path: "/workers/weaken.js", required: true },
        
        // Core (NOUVEAU v0.1.1)
        { path: "/core/early-creeper.js", required: true },
        
        // Tools (mis à jour v0.1.1)
        { path: "/tools/log-action.js", required: false },
        { path: "/tools/telemetry-daemon.js", required: false },
        { path: "/tools/blackbox.js", required: false },
        
        // Documentation
        { path: "/manifest.json", required: false },
        { path: "/docs/ChangeLogs/CHANGELOG.md", required: false }
    ];
    
    // ══════════════════════════════════════════════════════════════
    // HEADER
    // ══════════════════════════════════════════════════════════════
    
    ns.print("╔═══════════════════════════════════════════════════════════╗");
    ns.print("║              🐍 OUROBOROS v0.1.1 🐍                       ║");
    ns.print("║            Déploiement Automatique                        ║");
    ns.print("╚═══════════════════════════════════════════════════════════╝");
    ns.print("");
    ns.print(`📡 Repository: ${GITHUB_USER}/${REPO_NAME}`);
    ns.print(`🌿 Branch: ${BRANCH}`);
    ns.print(`📦 Files to deploy: ${FILES.length}`);
    ns.print("");
    
    await ns.sleep(1000);
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 1 : CRÉER STRUCTURE DOSSIERS
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("📁 ÉTAPE 1 : Création structure dossiers");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    
    const DIRS = ["/lib", "/core", "/workers", "/managers", "/state", "/tools", "/docs/ChangeLogs"];
    
    for (const dir of DIRS) {
        try {
            // Créer dossier via write dummy file
            await ns.write(`${dir}/.keep`, "", "w");
            ns.print(`✅ ${dir}/`);
        } catch (error) {
            ns.print(`⚠️  ${dir}/ (already exists or error)`);
        }
    }
    
    ns.print("");
    await ns.sleep(500);
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 2 : TÉLÉCHARGER FICHIERS
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("⬇️  ÉTAPE 2 : Téléchargement fichiers depuis GitHub");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    
    let successCount = 0;
    let failedCount = 0;
    const failedFiles = [];
    
    for (const file of FILES) {
        const url = BASE_URL + file.path;
        const localPath = file.path;
        
        ns.print(`⬇️  ${localPath}...`);
        
        try {
            const success = await ns.wget(url, localPath);
            
            if (success) {
                ns.print(`   ✅ Downloaded`);
                successCount++;
            } else {
                ns.print(`   ❌ FAILED`);
                failedCount++;
                failedFiles.push(file.path);
                
                if (file.required) {
                    ns.print(`   ⚠️  WARNING: This is a REQUIRED file!`);
                }
            }
        } catch (error) {
            ns.print(`   ❌ ERROR: ${error}`);
            failedCount++;
            failedFiles.push(file.path);
        }
        
        await ns.sleep(200);
    }
    
    ns.print("");
    await ns.sleep(500);
    
    // ══════════════════════════════════════════════════════════════
    // ÉTAPE 3 : VÉRIFICATION
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("🔍 ÉTAPE 3 : Vérification intégrité");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    
    let verifiedCount = 0;
    
    for (const file of FILES) {
        if (ns.fileExists(file.path)) {
            ns.print(`✅ ${file.path}`);
            verifiedCount++;
        } else {
            ns.print(`❌ ${file.path} (NOT FOUND)`);
        }
    }
    
    ns.print("");
    await ns.sleep(500);
    
    // ══════════════════════════════════════════════════════════════
    // RAPPORT FINAL
    // ══════════════════════════════════════════════════════════════
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("📊 RAPPORT DE DÉPLOIEMENT");
    ns.print("═════════════════════════════════════════════════════════════");
    ns.print("");
    ns.print(`📦 Total files: ${FILES.length}`);
    ns.print(`✅ Downloaded: ${successCount}`);
    ns.print(`🔍 Verified: ${verifiedCount}`);
    ns.print(`❌ Failed: ${failedCount}`);
    ns.print("");
    
    if (failedCount > 0) {
        ns.print("⚠️  FAILED FILES:");
        for (const path of failedFiles) {
            ns.print(`   - ${path}`);
        }
        ns.print("");
    }
    
    // ══════════════════════════════════════════════════════════════
    // STATUS FINAL
    // ══════════════════════════════════════════════════════════════
    
    if (failedCount === 0) {
        ns.print("╔═══════════════════════════════════════════════════════════╗");
        ns.print("║  🎉 DÉPLOIEMENT RÉUSSI !                                  ║");
        ns.print("║  🐍 OUROBOROS v0.1.1 est prêt à dévorer cette partie      ║");
        ns.print("╚═══════════════════════════════════════════════════════════╝");
        ns.print("");
        ns.print("🚀 PROCHAINES ÉTAPES:");
        ns.print("");
        ns.print("1️⃣  Lancer Early Creeper (orchestrateur early-game):");
        ns.print("   run /core/early-creeper.js");
        ns.print("");
        ns.print("2️⃣  Ou avec debug verbose:");
        ns.print("   run /core/early-creeper.js --debug 2");
        ns.print("");
        ns.print("3️⃣  Logger une action:");
        ns.print('   run /tools/log-action.js "OUROBOROS v0.1.1 déployé"');
        ns.print("");
        ns.print("4️⃣  Monitoring (optionnel, consomme 4.8GB RAM):");
        ns.print("   run /tools/telemetry-daemon.js");
        ns.print("");
        
        ns.toast("🐍 OUROBOROS v0.1.1 déployé avec succès !", "success", 5000);
        
    } else {
        ns.print("╔═══════════════════════════════════════════════════════════╗");
        ns.print("║  ⚠️  DÉPLOIEMENT INCOMPLET                                ║");
        ns.print("║  Certains fichiers n'ont pas pu être téléchargés         ║");
        ns.print("╚═══════════════════════════════════════════════════════════╝");
        ns.print("");
        ns.print("🔧 SOLUTIONS:");
        ns.print("");
        ns.print("1. Vérifier que le repository GitHub est public");
        ns.print("2. Vérifier l'URL dans le script (GITHUB_USER/REPO_NAME)");
        ns.print("3. Télécharger manuellement les fichiers manquants");
        ns.print("4. Relancer: run deploy.js");
        ns.print("");
        
        ns.toast("⚠️ Déploiement incomplet - Vérifier logs", "warning", 5000);
    }
    
    ns.print("═════════════════════════════════════════════════════════════");
    ns.tprint("🐍 OUROBOROS v0.1.1 deployment script finished. Check tail window for details.");
}
