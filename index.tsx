/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";

const settings = definePluginSettings({
    apiKey: {
        type: OptionType.STRING,
        description: "Hackatime API key",
        default: "CHANGEME",
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: "Show more debugging info",
        default: false,
    },
    machineName: {
        type: OptionType.STRING,
        description: "Hostname",
        default: "Vencord User",
    },
    projectName: {
        type: OptionType.STRING,
        description: "Project title",
        default: "Discord",
    },
});

export default definePlugin({
    name: "Hackatime",
    description: "Track your Discord usage within Hackatime!",
    authors: [
        { name: "lolo.zip", id: 547101350450692142 }
    ],
    settings,
    
    async sendHeartbeat() {
        const time = Date.now();
        const { debug, apiKey, machineName, projectName } = settings.store;

        if (!apiKey || apiKey === "CHANGEME") {
            if (debug) console.log("Hackatime API key not set. Skipping heartbeat.");
            return;
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
            plugin: "vencord/version discord-hackatime/v0.1",
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
                console.log("Using headers:", headers);
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
                if (debug) {
                    console.warn("Request URL:", url);
                    console.warn("Request body:", body);
                    console.warn("Response headers:", Object.fromEntries([...res.headers.entries()]));
                }
            }
        } catch (error) {
            console.error("Failed to send Hackatime heartbeat:", error);
        }
    },
    
    start() {
        this.updateInterval = setInterval(() => this.sendHeartbeat(), 120000);
        
        // Send an initial heartbeat
        setTimeout(() => this.sendHeartbeat(), 5000);
    },
    
    stop() {
        clearInterval(this.updateInterval);
    }
});