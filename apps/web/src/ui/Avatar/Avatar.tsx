import styles from "./Avatar.module.css";

type AvatarProps = { name: string; src?: string };

function toInitials(name: string) {
  return name
    .split(" ")
    .filter((_, index, words) => index === 0 || index === words.length - 1)
    .map((word) => word.charAt(0))
    .join("");
}

export function Avatar({ name, src }: AvatarProps) {
  if (src) {
    return <img className={styles.photo} src={src} alt="" />;
  }

  return (
    <span className={styles.initials} aria-hidden="true">
      {toInitials(name)}
    </span>
  );
}
