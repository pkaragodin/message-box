import Reactotron from 'reactotron-react-native'

Reactotron
  //.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from `react-native` or `@react-native-community/async-storage` depending on where you get it from
  .configure({
    host: "192.168.88.35"
  })
  .useReactNative({
    asyncStorage: false, // there are more options to the async storage.
    networking: { // optionally, you can turn it off with false.
      ignoreUrls: /symbolicate/
    },
    editor: false, // there are more options to editor
    errors: { veto: (stackFrame) => false }, // or turn it off with false
    overlay: false, // just turning off overlay
  })
  .connect();



// swizzle the old one
const yeOldeConsoleLog = console.log;

// make a new one
console.log = (...args) => {
  if(__DEV__) {
    // always call the old one, because React Native does magic swizzling too
    yeOldeConsoleLog(...args);

    // send this off to Reactotron.
    Reactotron.display({
      name: "CONSOLE.LOG",
      value: args,
      preview: args.length > 0 && typeof args[0] === "string" ? args[0] : null
    });
  }
};
