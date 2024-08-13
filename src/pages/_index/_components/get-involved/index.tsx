import React from 'react';
import { Section, SectionColor } from '@site/src/pages/_components/section';
import { SectionHeading } from '@site/src/pages/_components/section-heading';
import { SectionTag } from '@site/src/pages/_components/section-tag';
import useIsLive from '@site/src/pages/_hooks/use-is-live';
import styles from './get-involved.module.css';
import { Links } from '@site/src/constants';
import { SectionContent } from '@site/src/pages/_components/section-content';
import Link from '@docusaurus/Link';
import { Grid, GridItem } from '@site/src/pages/_components/grid';
import { Wednesday } from './wednesday';

type Props = {
  color?: SectionColor;
  tag?: React.ReactNode;
  heading?: React.ReactNode;
  intro?: React.ReactNode;
};

const DEFAULT_PROPS: Props = {
  color: 'green',
  tag: 'Get Involved',
  heading: 'Join the community',
  intro: (
    <p>
      Stop in to a wasmCloud Wednesday meeting, host a WebAssembly meetup, drop in on our Slack
      channel. There are plenty of ways to get connected with the wider community for support,
      insight, use-cases and expertise.
    </p>
  ),
};

function GetInvolved({
  color = DEFAULT_PROPS.color,
  tag = DEFAULT_PROPS.tag,
  heading = DEFAULT_PROPS.heading,
  intro = DEFAULT_PROPS.intro,
}: Props) {
  const { PLAYLIST, CALENDAR, GITHUB, SLACK } = Links;

  return (
    <Section color={color} id="community">
      <SectionContent>
        <SectionTag>{tag}</SectionTag>
        <SectionHeading>{heading}</SectionHeading>
      </SectionContent>
      <SectionContent>
        <Grid>
          <GridItem>
            {typeof intro === 'string' ? <p>{intro}</p> : intro}
            <ul className={styles.list}>
              <li>
                <Link href={GITHUB}>
                  <img src="/pages/home/icon/github.svg" alt="" />
                  <span>Star wasmCloud on GitHub</span>
                </Link>
              </li>
              <li>
                <Link href={SLACK}>
                  <img src="/pages/home/icon/slack.svg" alt="" />
                  <span>Join our Slack community</span>
                </Link>
              </li>
              <li>
                <Link href={PLAYLIST}>
                  <img src="/pages/home/icon/youtube.svg" alt="" />
                  <span>Watch past Community Calls</span>
                </Link>
              </li>
              <li>
                <Link href={CALENDAR}>
                  <img src="/pages/home/icon/calendar.svg" alt="" />
                  <span>Add to your calendar</span>
                </Link>
              </li>
            </ul>
          </GridItem>
          <GridItem>
            <Wednesday />
          </GridItem>
        </Grid>
      </SectionContent>
    </Section>
  );
}

export { GetInvolved };
