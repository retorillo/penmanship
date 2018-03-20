'use strict';
require('canvas-text-metrics-polyfill');
require('string.fromcodepoint');
const knockout = require('knockout');
const bootstrap = require('bootstrap');
const $ = require('jquery');
const kanjiList = require('./kanji-list.js');
const charBoxName = 'char';
const fontFamily = '"游ゴシック体", "Yu Gothic", YuGothic, sans-serif';
var updateQueue = [];
var updateQueueIndex = 0;
const viewmodel = {};
const canvasWidth = 300;
const canvasHeight = 300;
var baseline = 0;
var emHeightAscent = 0;
var emHeightDescent = 0;
var baselineReferenceCharacter = 'X';
var fontSizeMultiplier = 0.8;

viewmodel.text = knockout.observable();
viewmodel.randomKanji = function() {
  var pickup = [];
  for (var c = 0; c < 32; c++)
    pickup.push(String.fromCodePoint(pickRandom(kanjiList.regular)));
  viewmodel.text(pickup.join(''));
}
viewmodel.allHiragana = function() {
  viewmodel.text('あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん');
}
viewmodel.allKatakana = function() {
  viewmodel.text('アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン');
}
viewmodel.allAlphabet = function() {
  viewmodel.text('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}
viewmodel.text.subscribe(function(oldValue) {
  $('#placeholder').empty();
  $('#description').collapse('hide');
  updateQueue = [];
  viewmodel.text().split(/(?=.)/).forEach(function(ch) {
    if (!ch || /\s/.test(ch)) return;
    var div = $("<div>").attr('style', 'col').appendTo('#placeholder');
    var canvas = createCanvas().appendTo(div);
    updateQueue.push({ canvas: canvas, ch: ch });
  });
  updateQueueIndex = 0;
});
$(function() {
  $('[data-toggle="tooltip"]').tooltip();
  $('#description').collapse({ toggle: true });
  setInterval(function() {
    if (updateQueueIndex >= updateQueue.length)
      return;
    if (!baseline)
      baseline = computeBaseline(canvasHeight, baselineReferenceCharacter);
    var i = updateQueue[updateQueueIndex++];
    drawChar(i.canvas, i.ch);
  }, 50);
  knockout.applyBindings(viewmodel);
});
function pickRandom(list) {
  return list[Math.round(Math.random() * (list.length - 1))];
}
function watchObject(obj) {
  return {
    modified: { },
    baseObject: obj,
    set: function(p, v) {
      if (!Object.hasOwnProperty(this.modified, p))
        this.modified[p] = this.baseObject[p];
      this.baseObject[p] = v;
    },
    restore: function() {
      for (var p in this.modified)
        this.baseObject[p] = this.modified[p];
      this.modified = { };
    },
  };
}
function drawGuide(canvas, direction, value, thickness, style) {
  var ctx = canvas.get(0).getContext('2d');
  var ctxw = watchObject(ctx);
  ctxw.set('strokeStyle', style);
  ctxw.set('lineWidth', thickness);
  ctx.beginPath();
  if (/^h/.test(direction)) {
    ctx.moveTo(0, value);
    ctx.lineTo(canvas.width(), value);
  }
  else {
    ctx.moveTo(value, 0);
    ctx.lineTo(value, canvas.height());
  }
  ctx.closePath();
  ctx.stroke();
  ctxw.restore();
}
function computeGuides(direction, start, end, divide) {
  var guides = [];
  guides.push({ direction: direction, value: start, special: 'start' });
  guides.push({ direction: direction, value: end, special: 'end' });
  var step = (end - start) / divide;
  for (var c = 1; c < divide; c++) 
    guides.push({ direction: direction, value: Math.round(start + step * c) });
  return guides;
}
function createCanvas(){
  return $("<canvas>")
    .attr('width', canvasWidth)
    .attr('height', canvasHeight);
}

function computeBaseline(canvas_height, ref) {
  var ctx = createCanvas().get(0).getContext('2d')
  var height = Math.round(canvas_height * fontSizeMultiplier);
  ctx.font = [height + 'px', fontFamily].join(' ');
  var metric = ctx.measureText(ref);
  emHeightAscent = metric.emHeightAscent;
  emHeightDescent = metric.emHeightDescent;
  return Math.round((canvas_height + emHeightAscent + emHeightDescent) / 2);
}
function drawChar(canvas, ch) {
  var ctx = canvas.get(0).getContext('2d');
  var ctxw = watchObject(ctx);
  var height = Math.round(canvas.height() * fontSizeMultiplier);
  ctxw.set('font', [height + 'px', fontFamily].join(' '));
  ctxw.set('textAlign', 'center');
  ctxw.set('fillStyle', '#555');

  var horz = computeGuides('horz', baseline, baseline - emHeightAscent, 4);
  var vertstart = canvas.width() / 2 - emHeightAscent / 2;
  var vert = computeGuides('vert', vertstart, vertstart + emHeightAscent, 4);
  var guides = horz.concat(vert);
  guides.filter(function(i) { return !i.special; })
    .forEach(function(i) { drawGuide(canvas, i.direction, i.value, 1, '#bbb'); });
  guides.filter(function(i) { return i.special; })
    .forEach(function(i) { drawGuide(canvas, i.direction, i.value, 1, '#028'); });
  ctx.fillText(ch, canvas.width() / 2, baseline);
  ctxw.restore();
}
