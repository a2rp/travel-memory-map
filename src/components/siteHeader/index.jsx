import { FaGithub, FaMapMarkedAlt } from "react-icons/fa";
import styles from "./styles.module.css";

const SiteHeader = () => (
    <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top" aria-label="Fieldnotes home"><span className={styles.brandIcon}><FaMapMarkedAlt aria-hidden="true" /></span><span>fieldnotes</span></a>
        <nav className={styles.navigation} aria-label="Main navigation"><a href="#map">Memory map</a><a href="#memories">Memories</a></nav>
        <a className={styles.repositoryLink} href="https://github.com/a2rp/travel-memory-map" target="_blank" rel="noreferrer"><FaGithub aria-hidden="true" /><span>Repository</span></a>
    </header>
);

export default SiteHeader;
