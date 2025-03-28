// @ts-check

import { env } from 'node:process';
import { mkdir, cp, stat, readFile } from 'node:fs/promises';
import { resolve, basename, dirname, join, sep as pathSeparator } from 'node:path';
import { tmpdir } from 'node:os';

const DEFAULT_README_PATHS = [];
const DEFAULT_SKIP_PROJECTS = [];
const DEFAULT_OUTPUT_FOLDER = join(tmpdir(), 'update-docs-output');

/**
 * Update documentation for a given list of README relative to a given output folder
 *
 * This function will copy README files from the list of paths to the output folder,
 * guessing at the organizational structure (components/providers, project names).
 *
 * @param {object} cfg - Configuration for the update
 * @param {string} cfg.outputFolder - Folder into which READMEs will be copied (listed by project name)
 * @param {string[]} cfg.readmePaths - Paths/Glob patterns to READMEs that should be copied (case-sensitive)
 * @param {string[]} [cfg.skipProjects] - project names to skip (ex. 'custom-template')
 * @param {object} ctx - Extra context from the actions runner
 * @param {object} ctx.glob - @actions/glob import for matching paths
 */
export async function updateDocs(cfg, ctx = { glob: undefined }) {
  if (!cfg) {
    throw new Error('cfg not provided');
  }

  if (!ctx.glob) {
    throw new Error('glob function not provided');
  }

  const readmePaths = cfg.readmePaths;
  if (!readmePaths || !Array.isArray(readmePaths)) {
    throw new Error('missing/invalid README paths');
  }

  if (!cfg.outputFolder) {
    throw new Error('missing/invalid output folder');
  }
  const outputFolder = resolve(cfg.outputFolder);
  console.error(`writing to output folder [${outputFolder}]`);

  const projectsToSkip = new Set(cfg.skipProjects ?? []);

  // For every output path glob, we'll have to figure out
  let docsChanged = false;
  for (let readmeGlob of readmePaths) {
    console.error(`\n\nprocessing path/glob [${readmeGlob}]`);
    // Handle every readme path that matches the glob
    const pathGlob = await ctx.glob.create(readmeGlob);
    for await (const readmePath of pathGlob.globGenerator()) {
      const projectName = guessProjectName(readmePath);
      console.error(`\nprocessing project name [${projectName}] @ [${readmePath}]...`);

      // Skip projects that should be skipped
      if (projectsToSkip.has(projectName)) {
        console.error(`skipping project [${projectName}]...`);
        continue;
      }

      const componentOrProvider = guessComponentOrProvider(readmePath);
      console.error(`determined project is for a [${componentOrProvider}]`);

      // Determine the output path
      const outputDir = join(outputFolder, componentOrProvider, projectName);
      const outputPath = join(outputDir, 'index.md');

      // If the output path doesn't exist yet, we can assume things have changed
      try {
        await stat(outputPath);
      } catch (err) {
        if (err.message.includes('ENOENT')) {
          // If the output stat doesn't exist
          docsChanged = true;
          await mkdir(outputDir, { recursive: true });
          console.error(
            `no destination file present, copying README contents to [${outputPath}]...`,
          );
          await cp(readmePath, outputPath);
          continue;
        } else {
          throw err;
        }
      }

      // Read both files and check if contents have changed
      const [readmeFile, outputFile] = await Promise.all([
        readFile(readmePath, { encoding: 'utf8' }),
        readFile(outputPath, { encoding: 'utf8' }),
      ]);
      if (readmeFile.toString() !== outputFile.toString()) {
        docsChanged = true;
        console.error(`files differ, copying README contents to [${outputPath}]...`);
        await cp(readmePath, outputPath);
        continue;
      }

      console.error(`README file unchanged for project [${projectName}]`);
    }
  }

  // Return whether the docs have changed
  const result = {
    docs_changed: docsChanged,
  };
  console.log(`\nRETURNING:\n${JSON.stringify(result, null, 2)}`);
  return result;
}

/** Guess the project name of a readme path */
function guessProjectName(readmePath) {
  console.error(`guessing project name from path [${JSON.stringify(readmePath)}]...`);
  return basename(dirname(readmePath));
}

/** Guess whether the README is a component or provider */
function guessComponentOrProvider(readmePath) {
  for (const segment of readmePath.split(pathSeparator).reverse()) {
    if (segment.includes('component')) {
      return 'component';
    } else if (segment.includes('provider')) {
      return 'provider';
    }
  }
  throw new Error('failed to determine whether this README belonged to a component or provider');
}

/**
 * By default (ex. when executing this script file directly),
 * run `updateDocs` with env-provided config
 */
async function main() {
  await updateDocs({
    readmePaths: env.README_PATHS ? [env.README_PATHS] : DEFAULT_README_PATHS,
    outputFolder: env.OUTPUT_FOLDER ?? DEFAULT_OUTPUT_FOLDER,
    skipProjects: env.SKIP_PROJECTS ? [env.SKIP_PROJECTS] : DEFAULT_SKIP_PROJECTS,
  });
}

// If this file is being executed directly, run the main function
if (import.meta?.filename && import.meta?.filename === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
