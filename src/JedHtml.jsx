/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useMemo, useCallback } from 'react';
import Jed from 'jed';
import parse, { domToReact } from 'html-react-parser';

const literal = 'We offer <old-discount>%{oldDiscount}</old-discount> <bold>%{newDiscount}%</bold> discount';

const localeData = {
  en: {
    messages: {
      '': {
        domain: 'messages',
        lang: 'en',
      },
      [literal]: [
        'We offer <old-discount>%{oldDiscount}</old-discount> <bold>%{newDiscount}%</bold> discount',
      ],
    },
  },
  pl: {
    messages: {
      '': {
        domain: 'messages',
        lang: 'pl',
      },
      [literal]: [
        'Oferujemy zniżkę <old-discount>%{oldDiscount}</old-discount> <bold>%{newDiscount}%</bold>',
      ],
    },
  },
};

const normalizeMessage = (message) => {
  return message
    .replace(/(^\s+|\s+$)/g, '')
    .replace(/[ \n\f\r\t\v\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g, ' ');
};

const interpolate = (text, keys = {}) => {
  const reactElementKeys = [];
  const result = text.replace(/%{(\w+)}/g, (match, key) => {
    const hasValue = {}.hasOwnProperty.call(keys, key);
    if (!hasValue) {
      throw Error(`Missing interpolation "${key}" in:\n${text}`);
    }

    const value = keys[key];
    if (React.isValidElement(value)) {
      reactElementKeys.push(key);
      return `%{${key}}`;
    }

    return value;
  });

  if (reactElementKeys.length) {
    const resultArray = result.split(/(%{\w+})/g).map(part => {
      const key = (part.match(/^%{(\w+)}$/) || [])[1];

      return key && reactElementKeys.indexOf(key) > -1 ? keys[key] : part;
    });

    return resultArray[resultArray.length - 1] === '' ? resultArray.slice(0, -1) : resultArray;
  }

  return result;
};

const gettext = (i18n, message, interpolations) => {
  let interpolatedMessage = '';

  switch (typeof message) {
    case 'object':
      interpolatedMessage = i18n.gettext(normalizeMessage(message[0]));
      break;

    default:
      interpolatedMessage = interpolate(i18n.gettext(normalizeMessage(message)), interpolations);
  }

  // after interpolation, parse & reformat HTML tags
  const parseOptions = {
    replace: (node) => {
      if (node.type === 'tag' && node.name in interpolations) {
        return interpolations[node.name](domToReact(node.children, parseOptions));
      } else if (node.type === 'text') {
        return node.data;
      }
      return node;
    },
  };

  return parse(interpolatedMessage, parseOptions);
};

const JedHtml = () => {
  const [locale, setLocale] = useState('en');

  // in production you'll get this from React context
  const i18n = useMemo(() => {
    return new Jed({
      domain: 'messages',
      locale_data: localeData[locale],
    })
  }, [locale]);
  const __ = useCallback((message, interpolations) => gettext(i18n, message, interpolations), [i18n]);

  return (
    <section>
      <h2>jed + html-react-parse</h2>

      <form>
        <label>
          <input type="radio" name="locale" value="en" checked={locale === 'en'} onClick={() => setLocale('en')} />🇬🇧
        </label>
        <label>
          <input type="radio" name="locale" value="pl" checked={locale === 'pl'} onClick={() => setLocale('pl')} />🇵🇱
        </label>
      </form>

      <ul>
        <li>{literal}</li>
        <li>{__(literal, {
          oldDiscount: '12.45',
          newDiscount: '45.12',
          'old-discount': content => <s>{content}</s>,
          bold: content => <b>{content}</b>,
        })}</li>
      </ul>
    </section>
  );
};

export default JedHtml;
