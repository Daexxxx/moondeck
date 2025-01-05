import { CurrentHostSettings, useCurrentDisplayIdentifier } from "../../hooks";
import { Field, PanelSection, PanelSectionRow } from "@decky/ui";
import { ResolutionSelectionDropdown, ToggleField } from "../shared";
import { SettingsManager, UserSettings } from "../../lib";
import { FC } from "react";

interface Props {
  currentSettings: UserSettings | null;
  currentHostSettings: CurrentHostSettings | null;
  settingsManager: SettingsManager;
}

export const ResolutionPanel: FC<Props> = ({ currentSettings, currentHostSettings, settingsManager }) => {
  if (currentSettings === null || currentHostSettings === null) {
    return null;
  }

  if (!currentSettings.enableMoondeckShortcuts) {
    return null;
  }

  if (currentHostSettings.resolution.dimensions.length === 0 && !currentHostSettings.resolution.automatic) {
    return null;
  }

  const display = useCurrentDisplayIdentifier();
  const hasDimensions = currentHostSettings.resolution.dimensions.length > 0;
  const isLinkedDisplay = ((): boolean => {
    if (display !== null) {
      for (const dimension of currentHostSettings.resolution.dimensions) {
        if (dimension.linkedDisplays.includes(display)) {
          return true;
        }
      }
    }
    return false;
  })();
  const showCustomResolution = !isLinkedDisplay || !currentHostSettings.resolution.useLinkedDisplays;

  return (
    <PanelSection title="RESOLUTION">
      <PanelSectionRow>
        <ToggleField
          label="Pass to Moonlight"
          bottomSeparator={hasDimensions ? "none" : "standard"}
          value={currentHostSettings.resolution.passToMoonlight}
          setValue={(value) => settingsManager.updateHost((hostSettings) => { hostSettings.resolution.passToMoonlight = value; })}
        />
      </PanelSectionRow>
      {hasDimensions &&
        <>
          <PanelSectionRow>
            <ToggleField
              label="Enable linked displays"
              bottomSeparator={showCustomResolution ? "none" : "standard" }
              value={currentHostSettings.resolution.useLinkedDisplays}
              setValue={(value) => settingsManager.updateHost((hostSettings) => { hostSettings.resolution.useLinkedDisplays = value; })}
            />
          </PanelSectionRow>
          {showCustomResolution &&
            <>
              <PanelSectionRow>
                <ToggleField
                  label="Enable custom resolution"
                  bottomSeparator="none"
                  value={currentHostSettings.resolution.useCustomDimensions}
                  setValue={(value) => settingsManager.updateHost((hostSettings) => { hostSettings.resolution.useCustomDimensions = value; })}
                />
              </PanelSectionRow>
              <PanelSectionRow>
                <Field
                  childrenContainerWidth="fixed"
                  spacingBetweenLabelAndChild="none"
                >
                  <ResolutionSelectionDropdown
                    focusable={currentHostSettings.resolution.dimensions.length > 1}
                    currentIndex={currentHostSettings.resolution.selectedDimensionIndex}
                    currentList={currentHostSettings.resolution.dimensions}
                    setIndex={(value) => { settingsManager.updateHost((hostSettings) => { hostSettings.resolution.selectedDimensionIndex = value; }); }}
                  />
                </Field>
              </PanelSectionRow>
            </>
          }
        </>
      }
    </PanelSection>
  );
};
