import { BuddyStatusField, NumericTextInput, ServerStatusField, SettingsLoadingField } from "../shared";
import { DialogBody, DialogControlsSection, DialogControlsSectionHeader, Field } from "@decky/ui";
import { FC, useContext, useState } from "react";
import { useBuddyStatus, useCurrentHostSettings, useCurrentSettings, useServerStatus } from "../../hooks";
import { AddHostButton } from "./addhostbutton";
import { BuddyPairButton } from "./buddypairbutton";
import { HostForgetButton } from "./hostforgetbutton";
import { HostScanButton } from "./hostscanbutton";
import { HostSelectionDropdown } from "./hostselectiondropdown";
import { MoonDeckContext } from "../../contexts";

interface Host {
  id: string;
  name: string;
}

interface Settings {
  hostList: Host[];
  currentHostId: string | null;
}

export const HostSelectionView: FC = () => {
  const { settingsManager } = useContext(MoonDeckContext);
  const [isScanning, setIsScanning] = useState(false);
  const [serverStatus, serverRefreshStatus] = useServerStatus();
  const [buddyStatus, buddyRefreshStatus] = useBuddyStatus();
  const settings: Settings | null = useCurrentSettings();
  const hostSettings = useCurrentHostSettings();

  if (settings === null) {
    return <SettingsLoadingField />;
  }

  let buddySettings = null;
  if (hostSettings) {
    buddySettings = (
      <DialogControlsSection>
        <DialogControlsSectionHeader>MoonDeck Buddy</DialogControlsSectionHeader>
        <BuddyStatusField label="Status" status={buddyStatus} isRefreshing={buddyRefreshStatus} />
        <Field label="Buddy port" childrenContainerWidth="fixed">
          <NumericTextInput
            min={1}
            max={65535}
            value={hostSettings.buddy.port}
            setValue={(value) => {
              settingsManager.updateHost((hostSettings) => {
                hostSettings.buddy.port = value;
              });
            }}
          />
        </Field>
        <Field label="Pair with Buddy" childrenContainerWidth="fixed">
          <BuddyPairButton disabled={isScanning || buddyStatus !== "NotPaired"} />
        </Field>
      </DialogControlsSection>
    );
  }

  return (
    <DialogBody>
      <DialogControlsSection>
        <DialogControlsSectionHeader>GameStream Server</DialogControlsSectionHeader>
        <ServerStatusField label="Status" status={serverStatus} isRefreshing={serverRefreshStatus} />
        <Field
          label="Current host"
          childrenContainerWidth="fixed"
          description="Select the GameStream host you would like to connect to."
        >
          <HostSelectionDropdown
            disabled={isScanning}
            currentSettings={settings}
            hostList={settings.hostList}
            setHost={(value: string) => {
              settingsManager.update((settings: Settings) => {
                settings.currentHostId = value;
              });
            }}
          />
        </Field>
        <Field
          label="Scan local network"
          description="The GameStream service broadcasts itself on the local network for discovery (proxy on the host might prevent that)."
          childrenContainerWidth="fixed"
        >
          <HostScanButton
            disabled={isScanning}
            isScanning={isScanning}
            setIsScanning={setIsScanning}
          />
        </Field>
        <Field
          label="Add host manually"
          description="Add host by specifying a static address if it cannot be found via scanning."
          childrenContainerWidth="fixed"
        >
          <AddHostButton
            disabled={isScanning}
            onAddHost={(newHost: Host) => {
              settingsManager.update((settings: Settings) => {
                if (!settings.hostList.some((host) => host.id === newHost.id)) {
                  settings.hostList.push(newHost);
                }
              });
            }}
          />
        </Field>
        <Field label="Forget current host" childrenContainerWidth="fixed">
          <HostForgetButton
            disabled={isScanning || settings.currentHostId === null}
            currentHost={settings.currentHostId}
            onForget={(value: string) => {
              settingsManager.update((settings: Settings) => {
                settings.hostList = settings.hostList.filter((host) => host.id !== value);
                settings.currentHostId = null;
              });
            }}
          />
        </Field>
      </DialogControlsSection>
      {buddySettings}
    </DialogBody>
  );
};
