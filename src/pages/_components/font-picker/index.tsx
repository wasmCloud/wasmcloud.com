import BrowserOnly from '@docusaurus/BrowserOnly';

function FontPicker() {
  return (
    <BrowserOnly>
      {() => {
        const FontPickerButton = require('./font-picker-button').FontPickerButton;
        return <FontPickerButton />;
      }}
    </BrowserOnly>
  );
}

export { FontPicker };
