/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin, { OptionType } from '@utils/types';
import { showNotification } from "@api/Notifications";
import { definePluginSettings } from '@api/Settings';
import { ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import { Button, Forms, TextArea } from "@webpack/common";
import { http } from "@api/Http";

let lastHeartbeatAt = 0;

const settings = definePluginSettings({
    apiKey: {
        type: OptionType.STRING,
        description: 'API Key for hackatime',
        default: 'AAAAAAAAAAAAA',
        isValid: (e: string) => {
            if (e === "AAAAAAAAAAAAA") return "Invalid Key: Please change the default API Key";
            return true;
        },
    },
    debug: {
        type: OptionType.BOOLEAN,
        description: 'Enable debug mode',
        default: false,
    },
    machineName: {
        type: OptionType.STRING,
        description: 'Hostname',
        default: 'Vencord',
    },
    projectName: {
        type: OptionType.STRING,
        description: "Project Name",
        default: "Discord",
    },
});

function enoughTimePassed() {
    return lastHeartbeatAt + 120000 < Date.now();
}

async function sendHeartbeat(time: number) {
    const key = settings.store.apiKey;
    if (!key || key === "AAAAAAAAAAAAA") {
        showNotification({
            title: "Hackatime",
            body: "Don't forget to input your Hackatime API key within settings.",
            color: "var(--red-360)",
        });
        return;
    }

    if (settings.store.debug) {
        console.log("Sending heartbeat to Hackatime API.");
    }

    const url = "https://hackatime.hackclub.com/api/hackatime/v1";
    const body = {
        time: time / 1000,
        entity: "Discord",
        type: "app",
        project: settings.store.projectName ?? "Discord",
        plugin: "vencord/version discord-hackatime/v0.0.1",
    };

    const headers: Record<string, string> = {
        Authorization: `Basic ${key}`,
        "Content-Type": "application/json",
    };

    const machine = settings.store.machineName;
    if (machine) headers["X-Machine-Name"] = machine;

    try {
        const response = await http.post(url, {
            body: JSON.stringify(body),
            headers,
        });

        if (response.status < 200 || response.status >= 300) {
            console.warn(`Hackatime API Error ${response.status}: ${response.body}`);
        }
    } catch (err) {
        console.error("Hackatime request failed:", err);
    }
}

async function handleAction() {
    const time = Date.now();
    if (!enoughTimePassed()) return;
    lastHeartbeatAt = time;
    await sendHeartbeat(time);
}

export default definePlugin({
    name: 'hackatime',
    description: 'Track your Discord stats within Hackatime',
    authors: [
        {
            id: 547101350450692142,
            name: 'lolo.zip',
        },
    ],
    settings,
    start() {
        console.log('Initializing Hackatime plugin v');
        this.handler = handleAction.bind(this);
        document.addEventListener('click', this.handler);
    },
    stop() {
        console.log('Unloading Hackatime plugin');
        document.removeEventListener('click', this.handler);
    },
});