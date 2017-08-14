/**
 * affectimo
 * v0.4.0
 *
 * Analyse the affect (sentiment / valence) and intensity (arousal) of a string.
 *
 * Help me make this better:
 * https://github.com/phugh/affectimo
 *
 * Based on this paper:
 * Sedoc J., Preotiuc-Pietro D. & Ungar, L. (2017). Predicting Emotional Word Ratings using Distributional Representations and Signed Clustering. Proceedings of the 14th Conference of the European Chapter of the Association for Computational Linguistics, EACL.
 *
 * Using the affect/intensity lexicon data from http://www.wwbp.org/lexica.html
 * Used under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported licence
 *
 * (C) 2017 P. Hughes
 * Licence : Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 * http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 * Usage example:
 * const affectimo = require('affectimo');
 * const opts = {
 *  'threshold': -0.98,
 *  'encoding': 'binary'    // 'binary' (default), or 'frequency' - type of word encoding to use.
 * }
 * const str = "A big long string of text...";
 * const affect = affectimo(str, opts);
 * console.log(affect)
 *
 * Affect range: 1 = very negative, 5 = neutral, 9 = very positive
 * Intensity range: 1 = neutral/objective to 9 = very high
 * If there are no lexicon matches null will be returned
 *
 * Lexical weights run from a maximum of 0.91 to a minimum of -0.98
 * therefore a "threshold" value of -0.98 will include all words in the lexicon
 *
 * @param {string} str input string
 * @param {Object} opts options object
 * @return {Object} object with 'AFFECT' and 'INTENSITY' keys
 */

'use strict'
;(function () {
  const root = this
  const previous = root.affectimo

  let lexicon = root.lexicon
  let simplengrams = root.simplengrams
  let tokenizer = root.tokenizer

  if (typeof lexicon === 'undefined') {
    if (typeof require !== 'undefined') {
      lexicon = require('./data/lexicon.json')
      simplengrams = require('simplengrams')
      tokenizer = require('happynodetokenizer')
    } else throw new Error('affectimo requires happynodetokenizer and simplengrams, and ./data/lexicon.json')
  }

  /**
   * Get the indexes of duplicate elements in an array
   * @function indexesOf
   * @param  {Array} arr input array
   * @param  {string} el element to test against
   * @return {Array} array of indexes
   */
  const indexesOf = (arr, el) => {
    const idxs = []
    let i = arr.length
    while (i--) {
      if (arr[i] === el) {
        idxs.unshift(i)
      }
    }
    return idxs
  }

  /**
   * Combines multidimensional array elements into strings
   * @function arr2string
   * @param  {Array} arr input array
   * @return {Array} output array
   */
  const arr2string = arr => {
    let i = 0
    const len = arr.length
    const result = []
    for (i; i < len; i++) {
      result.push(arr[i].join(' '))
    }
    return result
  }

  /**
  * Loop through lexicon and match against array
  * @function getMatches
  * @param  {Array} arr token array
  * @param  {number} threshold  min. weight threshold
  * @return {Object} object of matches
  */
  const getMatches = (arr, threshold) => {
    // error prevention
    if (arr == null) return null
    if (threshold == null) threshold = -999
    if (typeof threshold !== 'number') threshold = Number(threshold)
    // loop through categories in lexicon
    const matches = {}
    let category
    for (category in lexicon) {
      if (!lexicon.hasOwnProperty(category)) continue
      let match = []
      let word
      let data = lexicon[category]
      // loop through words in category
      for (word in data) {
        if (!data.hasOwnProperty(word)) continue
        let weight = data[word]
        // if word from input matches word from lexicon ...
        if (arr.indexOf(word) > -1 && weight > threshold) {
          let count = indexesOf(arr, word).length // number of times the word appears in the input text
          match.push([word, count, weight])
        }
      }
      matches[category] = match
    }
    return matches
  }

  /**
  * Calculate the total lexical value of matches
  * @function calcLex
  * @param {Object} obj matches object
  * @param {number} wc wordcount
  * @param {number} int intercept value
  * @param {string} enc encoding
  * @return {number} lexical value
  */
  const calcLex = (obj, wc, int, enc) => {
    if (obj == null) return null
    let lex = 0
    let word
    for (word in obj) {
      if (!obj.hasOwnProperty(word)) continue
      if (enc === 'binary' || enc == null || wc == null) {
        // weight + weight + weight etc
        lex += Number(obj[word][2])
      } else {
        // (frequency / wordcount) * weight
        lex += (Number(obj[word][1]) / Number(wc)) * Number(obj[word][2])
      }
    }
    if (int != null) lex += Number(int)
    return lex
  }

  /**
  * Analyse the affect and intensity of a string
  * @function affectimo
  * @param {string} str input string
  * @param {Object} opts options object
  * @return {Object} object with 'AFFECT' and 'INTENSITY' keys
  */
  const affectimo = (str, opts) => {
    // error prevention
    if (str == null) return null
    if (typeof str !== 'string') str = str.toString()
    // option defaults
    if (opts == null) {
      opts = {
        'threshold': -999,    // minimum weight threshold
        'encoding': 'binary' // word encoding
      }
    }
    opts.encoding = opts.encoding || 'binary'
    opts.threshold = opts.threshold || -999
    // trim whitespace and convert to lowercase
    str = str.toLowerCase().trim()
    // convert our string to tokens
    let tokens = tokenizer(str)
    // if no tokens return 0
    if (tokens == null) return null
    // get wordcount before we add n-grams
    const wordcount = tokens.length
    // get n-grams
    const ngrams = []
    ngrams.push(arr2string(simplengrams(str, 2)))
    ngrams.push(arr2string(simplengrams(str, 3)))
    const nLen = ngrams.length
    let i = 0
    for (i; i < nLen; i++) {
      tokens = tokens.concat(ngrams[i])
    }
    // get matches from array
    const matches = getMatches(tokens, opts.threshold)
    // calculate lexical useage
    const enc = opts.encoding
    const lex = {}
    lex.AFFECT = calcLex(matches.AFFECT, wordcount, 5.037104721, enc)
    lex.INTENSITY = calcLex(matches.INTENSITY, wordcount, 2.399762631, enc)
    // return lexical value
    return lex
  }

  affectimo.noConflict = function () {
    root.affectimo = previous
    return affectimo
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = affectimo
    }
    exports.affectimo = affectimo
  } else {
    root.affectimo = affectimo
  }
}).call(this)
