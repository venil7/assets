import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import type { OverlayInjectedProps } from "react-bootstrap/esm/Overlay";
import { LabeledIcon } from "../Icons/Xs";
import "./HelpTip.scss";

export type HelpTipProps = { label: string; text: React.ReactNode };

export const HelpTip: React.FC<HelpTipProps> = ({ text, label }) => {
  const renderTooltip = (props: OverlayInjectedProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="right"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <span className="help-tip">
        <LabeledIcon icon={faQuestionCircle} label={label} />
      </span>
    </OverlayTrigger>
  );
};
