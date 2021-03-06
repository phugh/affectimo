# affectimo

Get the affect (sentiment or valence) and intensity (arousal) of a string.

## Usage
```javascript
const affectimo = require('affectimo');
const opts = {
  'encoding': 'binary',
  'locale': 'US',
  'logs': 2,
  'max': Number.POSITIVE_INFINITY,
  'min': Number.NEGATIVE_INFINITY,
  'nGrams': [2, 3],
  'noInt': false,
  'output': 'lex',
  'places': 9,
  'sortBy': 'freq',
  'wcGrams': false,
}
const str = 'A big long string of text...';
const affect = affectimo(str, opts);
console.log(affect)
```
---

## Default Output Example
```javascript
{
  'AFFECT': 5.341427583,
  'INTENSITY': 2.832817563
}
```

### Affect
Range: 1 = very negative, 5 = neutral, 9 = very positive.

### Intensity
Range: 1 = neutral/objective, to 9 = very high intensity.

### Errors or No Matches
If there is no input string, no matches in the lexicon, or there are errors, affectimo will return null.

---

## The Options Object

The options object is optional and provides a number of controls to allow you to tailor the output to your needs. However, for general use it is recommended that all options are left to their defaults.

### 'encoding'

**String - valid options: 'binary' (default), 'frequency', or 'percent'**

N.B - You probably don't want to change this, ever.

Controls how the lexical value is calculated.

Binary is simply the addition of lexical weights, i.e. word1 + word2 + word3.

Frequency encoding takes the overall wordcount and word frequency into account, i.e. (word frequency / word count) * weight.

Percent returns the percentage of token matches in each category as a decimal, i.e. 0.48 - 48%.

### 'locale'
**String - valid options: 'US' (default), 'GB'**
The lexicon data is in American English (US), if the string(s) you want to analyse are in British English set the locale option to 'GB'.

### 'logs'
**Number - valid options: 0, 1, 2, 3 (default)**
Used to control console.log, console.warn, and console.error outputs.
* 0 = suppress all logs
* 1 = print errors only
* 2 = print errors and warnings
* 3 = print all console logs

### 'max' and 'min'

**Float**

Exclude words that have weights above the max threshold or below the min threshold.

By default these are set to infinity, ensuring that no words from the lexicon are excluded.

Lexical weights run from a maximum of 0.91 to a minimum of -0.98.

### 'nGrams'

**Array - valid options: [ number, number, ...]**

n-Grams are contiguous pieces of text, bi-grams being chunks of 2, tri-grams being chunks of 3, etc.

Use the nGrams option to include n-gram chunks. For example if you want to include both bi-grams and tri-grams, use like so:

```javascript
{
  nGrams: [2, 3]
}
```

If you only want to include tri-grams:

```javascript
{
  nGrams: [3]
}
```

To disable n-gram inclusion, use the following:

```javascript
{
  nGrams: [0]
}
```

If the number of words in the string is less than the ngram number provided, the option will simply be ignored.

For accuracy it is recommended that n-grams are included, however including n-grams for very long strings can affect performance.

### 'noInt'

**Boolean - valid options: true or false (default)**

The lexica contain intercept values, set noInt to true to ignore these values.

Unless you have a specific need to ignore the intercepts, it is recommended you leave this set to false.

### 'output'

**String - valid options: 'lex' (default), 'matches', or 'full'**

'lex' returns the lexical values for affect and intensity. See "default output example" above.

'matches' returns an array of matched words along with the number of times each word appears, its weight, and its final lexical value. See the output section below for an example.

'full' returns an object containing the lexical value and the matches array.

### 'places'

**Number**

Number of decimal places to limit outputted values to.

The default is 9.

### 'sortBy'

**String - valid options: 'freq' (default), 'lex', 'weight'**

If 'output' = 'matches', this option can be used to control how the outputted array is sorted.

'lex' sorts by final lexical value, i.e. (word frequency * word count) / word weight.

'weight' sorts the array by the matched words initial weight.

'freq' (default) sorts by word frequency, i.e. the most used words appear first.

### 'wcGrams'

**Boolean - valid options: true, or false (default)**

When set to true, the output from the nGrams option will be added to the word count.

For accuracy it is recommended that this is set to false.

---

## {output: 'matches'} Output Example

```javascript
{
  AFFECT:
    matches:
    [
      [ 'magnificent', 1, -192.0206116, -1.3914537072463768 ],
      [ 'capital', 1, -133.9311307, -0.9705154398550726 ],
      [ 'note', 3, -34.83417005, -0.7572645663043478 ],
      [ 'america', 2, -49.21227355, -0.7132213557971014 ],
      [ 'republic', 1, -75.5720402, -0.5476234797101449 ]
    ],
    info:
    {
      total_matches: 100,
      total_token: 200,
      total_unique_matches: 64,
      percent_matches: 50
    }
  INTENSITY:
    [
      ....
    ],
  ...
};
```

---

## Acknowledgements

### References
Based on [Preotiuc-Pietro, D., Schwartz, H.A., Park, G., Eichstaedt, J., Kern, M., Ungar, L., Shulman, E.P. (2016). Modelling Valence and Arousal in Facebook Posts. Proceedings of the Workshop on Computational Approaches to Subjectivity, Sentiment and Social Media Analysis (WASSA), NAACL.](http://wwbp.org/papers/va16wassa.pdf)

### Lexicon
Using the affect/intensity lexicon data from [WWBP](http://www.wwbp.org/lexica.html) under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.

## License
(C) 2017-18 [P. Hughes](https://www.phugh.es). All rights reserved.

Shared under the [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported](http://creativecommons.org/licenses/by-nc-sa/3.0/) license.