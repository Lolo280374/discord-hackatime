/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./style.css";

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { closeModal, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { findComponentByCodeLazy } from "@webpack";
import { Button, Select, Text, TextInput, useEffect, useRef, useState } from "@webpack/common";

const Native = VencordNative.pluginHelpers.CSPManager as PluginNative<typeof import("./native")>;

type PolicyMap = Record<string, string[]>;

const ConnectSrc = ["connect-src"];
const MediaSrc = [...ConnectSrc, "img-src", "media-src"];
const CssSrc = ["style-src", "font-src"];
const MediaAndCssSrc = [...MediaSrc, ...CssSrc];
const MediaScriptsAndCssSrc = [...MediaAndCssSrc, "script-src", "worker-src"];

const settings = definePluginSettings({
    cspRuleComponent: {
        type: OptionType.COMPONENT,
        component: SettingsBlock
    },
});

type CSPolicy = { id: string; domain: string; policy: string[]; };

function SettingsBlock() {
    const AddButton = findComponentByCodeLazy('.Text,{color:"interactive-active",variant:"text-md/semibold",');
    const [csPolicies, setCsPolicies] = useState([] as CSPolicy[]);
    const containerRef = useRef(null as HTMLDivElement | null);

    useEffect(() => {
        (async () => {
            const currentPolicies = await Native.getCurrentCSPPolicies();
            const policies = Object.entries(currentPolicies).map(p => ({
                id: Math.random().toString(36).substring(2, 10),
                domain: p[0],
                policy: p[1]
            }));

            setCsPolicies(policies);
        })();
    }, []);

    const onDelete = (id: string) => {
        // kinda disgusting but having to scroll back to the bottom is more so disgusting
        const scroller = containerRef.current?.parentElement?.parentElement?.parentElement;
        const currentScroll = scroller?.scrollTop;
        setCsPolicies(p => p.filter(p => p.id !== id));

        setTimeout(() => {
            console.log(scroller);
            if (scroller)
                scroller.scrollTop = currentScroll || 0;
        }, 0);
    };

    const onAdd = () => {
        setCsPolicies([
            ...csPolicies, {
                id: Math.random().toString(36).substring(2, 10),
                domain: "",
                policy: ConnectSrc
            }
        ]);
    };

    const onUpdate = (id: string, domain: string, policy: string[]) => {
        setCsPolicies(p => p.map(p => p.id === id ? { ...p, domain, policy } : { ...p }));
    };

    const updatePolicies = async () => {
        const policies = {};

        csPolicies.forEach(p => {
            if (p.domain) {
                policies[p.domain] = p.policy;
            }
        });

        const successful = await Native.updateCSPPolicies(policies);

        const key = openModal(modalProps => <ModalRoot {...modalProps}>
            <ModalHeader>
                <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>CSPManager: Attention!</Text>
                <ModalCloseButton onClick={() => closeModal(key)} />
            </ModalHeader>

            <ModalContent>
                <Text variant="text-md/normal">
                    {successful ? "Please reload your client for the changes to take effect." : "CSP modification cancelled."}
                </Text>
            </ModalContent>

            <ModalFooter>
                <Button color={Button.Colors.BRAND} onClick={() => window.location.reload()}>Reload Now</Button>
            </ModalFooter>
        </ModalRoot>);
    };

    function SettingsBlockRow({
        id,
        storedDomain,
        storedPolicy,
        onUpdate,
        onDelete
    }: {
        id: string;
        storedDomain:
        string;
        storedPolicy: string[];
        onUpdate: (id: string, domain: string, policy: string[]) => void;
        onDelete: (id: string) => void;
    }) {
        const [domain, setDomain] = useState(storedDomain);
        // you cant directly compare arrays so this is the easiest solution lol
        const [policy, setPolicy] = useState(storedPolicy.join(" "));

        const onChangeDomain = (newDomain: string) => {
            const newRuleSet = { ...csPolicies };
            delete newRuleSet[domain];
            newRuleSet[newDomain] = policy;

            setDomain(newDomain);
        };

        const onLoseDomainFocus = () => {
            onUpdate(id, domain, policy.split(" "));
        };

        const onChangePolicy = newPolicy => {
            const newRuleSet = { ...csPolicies };
            newRuleSet[domain] = newPolicy.value;

            setPolicy(newPolicy.join(" "));
            onUpdate(id, domain, newPolicy);
        };

        return <div className={"cspmanager-block"}>
            <TextInput value={domain} onChange={onChangeDomain} onBlur={onLoseDomainFocus} className="cspmanager-input" />

            <Select
                options={[
                    { value: ConnectSrc, label: "Connect" },
                    { value: MediaSrc, label: "Media" },
                    { value: CssSrc, label: "Css" },
                    { value: MediaAndCssSrc, label: "Media&Css" },
                    { value: MediaScriptsAndCssSrc, label: "Media&Scripts&Css" },
                ]}
                serialize={String}
                isSelected={v => v.join(" ") === policy}
                select={onChangePolicy}
                className={"cspmanager-select"}
            />

            <Button
                size={Button.Sizes.ICON}
                style={{ width: 44, height: 44, lineHeight: 0 }}
                color={Button.Colors.PRIMARY}
                onClick={() => onDelete(id)}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    role="img"
                >
                    <path fill="var(--text-feedback-critical)" d="M17.3 18.7a1 1 0 0 0 1.4-1.4L13.42 12l5.3-5.3a1 1 0 0 0-1.42-1.4L12 10.58l-5.3-5.3a1 1 0 0 0-1.4 1.42L10.58 12l-5.3 5.3a1 1 0 1 0 1.42 1.4L12 13.42l5.3 5.3Z" />
                </svg>
            </Button>
        </div>;
    }

    return <div className="cspmanager-container" ref={containerRef}>
        {csPolicies.map(p => (
            <SettingsBlockRow
                key={p.id}
                id={p.id}
                storedDomain={p.domain}
                storedPolicy={p.policy}
                onDelete={onDelete}
                onUpdate={onUpdate}
            />
        ))}

        <AddButton
            text={"Add Rule"}
            tooltip={"Add a CSP rule."}
            className="cspmanager-add"
            onClick={onAdd}
        />

        <Button color={Button.Colors.BRAND} onClick={updatePolicies}>Save Content Security Policies</Button>
    </div>;
}

export default definePlugin({
    name: "CSPManager",
    description: "Allows manual control of Vencords CSP.",
    authors: [Devs.surgedevs, { name: "paipai", id: 1375697625864601650n }],
    required: true,
    settings
});
