/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { showNotification } from "@api/Notifications";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import { Button, Text } from "@webpack/common";

// Access the CSP native module directly
const CSPNative = VencordNative.pluginHelpers.CSPManager as PluginNative<{
    getCurrentCSPPolicies: () => Record<string, string[]>;
    updateCSPPolicies: (policies: Record<string, string[]>) => Promise<boolean>;
}>;

const HACKATIME_DOMAIN = "hackatime.hackclub.com";
const REQUIRED_POLICY = ["connect-src"];

const settings = definePluginSettings({
    apiKey: {
        name: "Hackatime API key",
        type: OptionType.STRING,
        description: "Your Hackatime API key. Grab it at hackatime.hackclub.com/my/settings!",
        default: "CHANGEME",
        isValid: (e: string) => {
            if (e === "CHANGEME") return "Please, enter your Hackatime API key into the plugin's settings.";
            return true;
        },
    },
    autoConfigureCSP: {
        name: "Auto-configure Content Security Policy",
        type: OptionType.BOOLEAN,
        description: "You should keep this enabled. This will make sure Discord allows connection to Hackatime's APIs, by allowing it in the CSP allowlist (Content Security Policy).",
        default: true
    },
    debug: {
        name: "Verbose logging mode",
        type: OptionType.BOOLEAN,
        description: "This will show more logging information for debugging purposes in the Electron DevTools console.",
        default: false,
    },
    machineName: {
        name: "Hostname",
        type: OptionType.STRING,
        description: "The name of your machine used for Hackatime, mostly for identifying your devices more easily if you use multiple on the same account.",
        default: "Vencord",
    },
    projectName: {
        name: "Shown Project Name",
        type: OptionType.STRING,
        description: "The project that'll be shown on Hackatime as the one you're currently working on.",
        default: "lolo280374/discord-hackatime on GitHub!!!",
    }
});

export default definePlugin({
    name: "Hackatime",
    description: "Track your Discord usage and send heartbeats to Hackatime!",
    authors: [
        { name: "lolo.zip", id: 547101350450692142n }
    ],
    settings,
    
    // Check if the domain is already in the CSP
    async checkCSP() {
        try {
            // Get current CSP policies
            const policies = await CSPNative.getCurrentCSPPolicies();
            
            // Check if our domain is already allowed
            if (policies[HACKATIME_DOMAIN]?.includes("connect-src")) {
                if (settings.store.debug) console.log("Pass... Hackatime is already on the CSP allowlist.");
                return true;
            }
            
            return false;
        } catch (e) {
            console.error("CSP couldn't be checked for the following reason:", e);
            return false;
        }
    },
    
    // Show instruction notification before CSP dialog
    showCSPInstructionModal() {
        const key = openModal(modalProps => (
            <ModalRoot {...modalProps}>
                <ModalHeader>
                    <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>Hackatime: Action Required</Text>
                    <ModalCloseButton onClick={() => closeModal(key)} />
                </ModalHeader>
                <ModalContent>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <Text variant="text-md/semibold">
                            Hackatime needs permission to connect to its servers
                        </Text>
                        <Text variant="text-md/normal">
                            In the next info dialog that appears, please click "<strong>Yes</strong>" to allow Hackatime to connect to its API server.
                        </Text>
                        <div style={{ backgroundColor: "var(--info-warning-background)", padding: "10px", borderRadius: "8px" }}>
                            <Text variant="text-md/normal" style={{ color: "var(--info-warning-foreground)" }}>
                                This is required for the plugin to work. Without this permission, Hackatime cannot track your Discord usage.
                            </Text>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button color={Button.Colors.BRAND} onClick={() => {
                        closeModal(key);
                    }}>
                        I understand
                    </Button>
                </ModalFooter>
            </ModalRoot>
        ));
    },
    
    // Add the domain to the CSP
    async configureCSP(silent = false) {
        try {
            // Get current policies
            const policies = await CSPNative.getCurrentCSPPolicies();
            
            // Add our domain if not already present
            if (!policies[HACKATIME_DOMAIN]) {
                policies[HACKATIME_DOMAIN] = REQUIRED_POLICY;
                
                if (settings.store.debug) console.log("Adding Hackatime domain to CSP:", policies);
                
                // Show instruction notification before showing the system dialog
                if (!silent) {
                    this.showCSPInstructionModal();
                    
                    // Short delay to ensure user reads the notification
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                // Update CSP policies (this will show a confirmation dialog)
                const success = await CSPNative.updateCSPPolicies(policies);
                
                if (success) {
                    if (!silent) {
                        // Show a notification that a reload is needed
                        const key = openModal(modalProps => (
                            <ModalRoot {...modalProps}>
                                <ModalHeader>
                                    <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>Hackatime: CSP Updated</Text>
                                    <ModalCloseButton onClick={() => closeModal(key)} />
                                </ModalHeader>
                                <ModalContent>
                                    <Text variant="text-md/normal">
                                        Success! CSP rules have been updated to allow connections to Hackatime servers.
                                        Please reload Discord for changes to take effect, and to start tracking activity.
                                    </Text>
                                </ModalContent>
                                <ModalFooter>
                                    <Button color={Button.Colors.BRAND} onClick={() => {
                                        closeModal(key);
                                        window.location.reload();
                                    }}>
                                        Reload Now
                                    </Button>
                                </ModalFooter>
                            </ModalRoot>
                        ));
                    }
                    return true;
                } else {
                    if (!silent) {
                        // Show failure notification
                        showNotification({
                            title: "Hackatime: Permission denied",
                            body: "CSP wasn't updated. Hackatime will not work.",
                            color: "var(--status-danger)"
                        });
                    }
                    if (settings.store.debug) console.log("User declined CSP modification");
                    return false;
                }
            } else {
                // Already configured
                return true;
            }
        } catch (e) {
            console.error("Failed to configure CSP:", e);
            return false;
        }
    },
    
    async sendHeartbeat() {
        const time = Date.now();
        const { debug, apiKey, machineName, projectName } = settings.store;

        if (!apiKey || apiKey === "CHANGEME") {
            if (debug) console.log("If you're reading this, change your API key. Heartbeats have been disabled cuz of that.");
            return;
        }

        // Check CSP configuration
        const cspConfigured = await this.checkCSP();
        if (!cspConfigured) {
            if (debug) console.log("CSP not configured for Hackatime. Attempting to configure...");
            await this.configureCSP();
            return; // Skip this heartbeat, will try again after reload or next interval
        }

        if (debug) console.log("Sending heartbeat to Hackatime API.");

        // Use the correct endpoint based on the setup.sh script
        const baseUrl = "https://hackatime.hackclub.com/api/hackatime/v1";
        const url = `${baseUrl}/users/current/heartbeats`;
        
        // Format data as an array of heartbeats
        const heartbeat = {
            time: Math.floor(time / 1000),
            entity: "Discord",
            type: "app",
            language: "Discord",
            project: projectName ?? "Discord",
            plugin: "DiscordDesktop/Vencord discord-hackatime/v0.1",
        };
        
        // Send as an array (even with just one heartbeat)
        const body = JSON.stringify([heartbeat]);

        const headers = {
            // Use Bearer token authentication
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...(machineName ? { "X-Machine-Name": machineName } : {})
        };

        try {
            if (debug) {
                console.log("Request URL:", url);
                console.log("Request body:", body);
            }

            const res = await fetch(url, {
                method: "POST",
                body: body,
                headers: headers,
            });

            const responseText = await res.text();
            
            if (res.ok) {
                if (debug) console.log("Hackatime heartbeat sent successfully:", responseText);
            } else {
                console.warn(`Hackatime API Error ${res.status}:`, responseText);
            }
        } catch (error) {
            console.error("Failed to send Hackatime heartbeat:", error);
            
            // If we get a CSP error despite our checks, try to reconfigure
            if (error.toString().includes("Content Security Policy")) {
                showNotification({
                    title: "Hackatime: Connection error",
                    body: "Looks like we can't connect to Hackatime. Click here to try a fix.",
                    onClick: () => this.configureCSP(false)
                });
            }
        }
    },
    
    async start() {
        // Auto-configure CSP if enabled
        if (settings.store.autoConfigureCSP) {
            const isConfigured = await this.checkCSP();
            if (!isConfigured) {
                this.configureCSP();
            }
        }
        
        this.updateInterval = setInterval(() => this.sendHeartbeat(), 120000);
        
        // Send an initial heartbeat after a delay to allow CSP to be configured
        setTimeout(() => this.sendHeartbeat(), 15000);
    },
    
    stop() {
        clearInterval(this.updateInterval);
    }
});