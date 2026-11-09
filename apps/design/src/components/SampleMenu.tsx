import Button from "@singularity/design-system/Button";
import Icon from "@singularity/design-system/Icon";
import type { IconName } from "@singularity/design-system/icons";
import Menu from "@singularity/design-system/Menu";
import MenuItem from "@singularity/design-system/MenuItem";

interface Props {
  id: string;
  trigger: string;
  title: string;
  subtitle?: string | undefined;
  rows: readonly (readonly [IconName, string])[];
  danger?: string | undefined;
}

/**
 * The Menu page's preview: the Menu, its trigger and its rows in one React island, as an Astro page
 * draws a menu (an Astro slot would reach the island as static markup, outside Base UI's tree).
 */
export default function SampleMenu({ id, trigger, title, subtitle, rows, danger }: Props) {
  return (
    <Menu
      id={id}
      title={title}
      subtitle={subtitle}
      trigger={<Button variant="tonal">{trigger}</Button>}
    >
      {rows.map(([icon, label]) => (
        <MenuItem key={label}>
          <Icon name={icon} /> {label}
        </MenuItem>
      ))}
      {danger && (
        <MenuItem tone="danger">
          <Icon name="trash" /> {danger}
        </MenuItem>
      )}
    </Menu>
  );
}
