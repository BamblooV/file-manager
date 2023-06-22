const parseArgs = (args) => {
  const result = args.reduce((acc, arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.split("=");
      if (key.slice(2)) {
        acc[key.slice(2)] = value;
      }
    }

    return acc;
  },
    {}
  );

  return result;
}

export default parseArgs;