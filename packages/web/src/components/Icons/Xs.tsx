import * as icons from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type React from "react";

export const LabeledIcon: React.FC<{
  icon: icons.IconDefinition;
  label: string;
}> = ({ icon, label }) => (
  <>
    <FontAwesomeIcon icon={icon} size="xs" />
    &nbsp;{label}
  </>
);
