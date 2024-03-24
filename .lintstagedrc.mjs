import path from 'path';

const nextLintCmd = (filenames) =>
  `eslint --fix --file ${filenames.map((f) => path.relative(process.cwd(), f)).join(' --file ')}`;

const prettierCmd = (filenames) =>
  `prettier --write ${filenames.map((f) => path.relative(process.cwd(), f)).join(' ')}`;

export default {
  '*.{js,jsx,ts,tsx}': [nextLintCmd, prettierCmd],
};
