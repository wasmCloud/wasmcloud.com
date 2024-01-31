import React from "react";
import clsx from "clsx";
import styles from "./styles.module.css";
import { useColorMode } from "@docusaurus/theme-common";

const root = "/img/features";
const FeatureList = [
  {
    title: "Declarative WebAssembly Orchestration",
    image: {
      name: "cloud",
      alt: "Multiple type of devices around wasmCloud logo",
    },
    imageLast: false,
    description: (
      <>
        Write your application as a <b>declarative</b>{" "}
        set of WebAssembly components. Deploy your application to any cloud,
        edge, or IoT device with a single command.
      </>
    ),
  },
  {
    title: "Seamless Distributed Networking",
    image: {
      name: "connected",
      alt: "A message bus connecting multiple wasmCloud hosts",
    },
    imageLast: true,
    description: (
      <>
        Using{" "}
        <b>NATS</b>, wasmCloud hosts cluster together across disparate clouds
        and infrastructure, distributing your apps with a single flat topology
        without ever opening a single firewall port. Clusters self-form and
        self-heal to automatically enable load balancing and failover without
        building it into your app.
      </>
    ),
  },
  {
    title: "Vendorless Application Components",
    image: { name: "secure", alt: "The wasmCloud logo inside a lock" },
    imageLast: false,
    description: (
      <>
        wasmCloud WebAssembly components are completely <b>vendorless</b>{" "}
        and don't tie you to any platform, cloud, or proprietary implementation.
        Swap out implementations and change your underlying infrastructure at
        any time without changing your application code.
      </>
    ),
  },
];

function FeatureImageComponent({ image }) {
  const { colorMode } = useColorMode();
  return (
    <img
      className={styles.featureSvg}
      src={root +
        "/feature-" +
        image.name +
        (colorMode === "dark" ? "-dark.svg" : "-light.svg")}
      alt={image.alt}
    />
  );
}

function FeatureTextComponent({ title, description }) {
  return (
    <div className={styles.featureText} align="left">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function Feature({ image, title, description, imageLast }) {
  return (
    <div className={clsx(styles.featureRow, imageLast && styles.frImageLast)}>
      <FeatureImageComponent image={image} />
      <FeatureTextComponent title={title} description={description} />
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <div className="container">
      <div className={styles.featuresContainer}>
        {FeatureList.map((props, idx) => <Feature key={idx} {...props} />)}
      </div>
    </div>
  );
}
