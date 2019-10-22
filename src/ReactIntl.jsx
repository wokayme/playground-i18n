/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import { useIntl, IntlProvider } from 'react-intl';

const messages = {
  key: {
    id: 'some.key',
    defaultMessage: 'We offer <old-discount>{oldDiscount}</old-discount> <bold>{newDiscount}%</bold> discount',
  }
};

const Literal = () => {
  const intl = useIntl();
  return (
    <ul>
      <li>
        {messages.key.defaultMessage}
      </li>
      <li>
        {intl.formatMessage(messages.key, {
          oldDiscount: '12.45',
          newDiscount: '45.12',
          'old-discount': content => <s>{content}</s>,
          bold: content => <b>{content}</b>,
        })}
      </li>
    </ul>
  );
};

const en = {
  'some.key': 'We offer <old-discount>{oldDiscount}</old-discount> <bold>{newDiscount}%</bold> discount',
};

const pl = {
  'some.key': 'Oferujemy zniżkę <old-discount>{oldDiscount}</old-discount> <bold>{newDiscount}%</bold>',
};

const translations = {
  en,
  pl,
};

const ReactIntl = () => {
  const [locale, setLocale] = useState('en');

  return (
    <section>
      <h2>react-intl</h2>

      <form>
        <label>
          <input type="radio" name="locale" value="en" checked={locale === 'en'} onClick={() => setLocale('en')} />🇬🇧
        </label>
        <label>
          <input type="radio" name="locale" value="pl" checked={locale === 'pl'} onClick={() => setLocale('pl')} />🇵🇱
        </label>
      </form>

      <IntlProvider locale={locale} messages={translations[locale]}>
        <Literal />
      </IntlProvider>
    </section>
  );
};

export default ReactIntl;
