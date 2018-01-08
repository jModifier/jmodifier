
/*


	jModifier v0.1 (Alpha) - Written by Jeremy J Parmenter a.k.a. @JeremyJaydan


	The MIT License (MIT)

	Copyright © 2017 Jeremy Parmenter

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.

*/

const jModifier = (function(a, b){
	return {
		"getAlts": function(obj){
			if(!obj) obj = jModifier.alts;
			for(let i = 0, keys = Object.keys(obj); i < keys.length; i++){
				let key = keys[i];
				obj[key] = jModifier.object.pathValue(this, obj[key]);
			}
			return obj;
		},
		"for": function(arr, cb, opts){
			if(arr){
				if(arr.constructor === Number) arr = jModifier.array.fill(new Array(arr));
				if(typeof cb === "function"){
					
					opts = opts || {};
					arr = opts.reverse ? jModifier.array.reverse(arr) : opts.shuffle ? jModifier.array.shuffle(arr) : arr;
	
					if(opts.dupe && !opts.dupeInit){
						let dArr = [], rep = opts.dupe;
						for(let i = 0; i < rep; i++){
							for(let a = 0; a < arr.length; a++) dArr.push(arr[a]);
						}
						arr = dArr;
					}
	
					let init = function(){
						for(let i = 0; i < arr.length; i++){
							if(opts.interval){
								let timeout = i === 0 ? 0 : (
									opts.interval.constructor === Array ? (
										jModifier.array.sum(opts.interval, i)
									) : opts.interval * i
								);
								setTimeout(cb, timeout, arr[i], i);
							}else{
								cb(arr[i], i);
							}
						}
					}
	
					opts.delay ? setTimeout(init, opts.delay) : init();
					setTimeout(function(){
						if(opts.done && opts.done.constructor === Function) opts.delay ? setTimeout(opts.done, opts.delay) : opts.done();
						if(opts.loop){
							opts.loop--;
							opts.dupeInit = true;
							jModifier.for(arr, cb, opts);
						}
					}, opts.interval ? (
							opts.interval.constructor === Array ? jModifier.array.sum(opts.interval) : (opts.interval * arr.length)
						) : 0
					);
				}
			}
		},
		"dom": {
			query: function(a, b, forceArray){
				if(b){
					let parent = jModifier.dom.query(a, null, true);
					if(b.constructor === Object){
						let keys = Object.keys(b);
						jModifier.for(keys, function(key, index){
							let elements = jModifier.dom.query(parent, b[key]);
							b[key] = elements.length > 1 ? elements : elements[0];
						});
						return b;
					}else{
						let collection = [];
						for(let i = 0, length = parent ? parent.length : undefined; i < length; i++){
							let element = parent[i].querySelectorAll(b);
							for(let s = 0, eLength = element.length; s < eLength; s++){
								collection.push(element[s]);
							}
						}
						return collection;
					}
				}else{
					let elements = [];
					jModifier.for(jModifier.array.wrap(a), function(item){
						let i = item.constructor === String ? document.querySelectorAll(item) : item;
						jModifier.for(jModifier.array.wrap(i), function(element){
							if(element instanceof Element || element === window) elements.push(element);
						});
					});
					let result = !forceArray ? elements.length > 1 ? elements : elements[0] : elements;
					if(!result && jModifier.log) console.info("jModifier: Query ran with no results: ", a, b);
					return result;
				}
			},
			on: function(trgt, func, ucap){
				let events = jModifier.function.getArguments(func);
				events.shift();
				let elements = jModifier.dom.query(trgt, null, true);
				jModifier.for(elements, function(element, index){
					for(let i = 0, evLength = events.length; i < evLength; i++){
						let e = element === window ? window : {node: element, index, elements};
						element.addEventListener(events[i], function(evt){
							let args = [e];
							args[events.indexOf(evt.type) + 1] = evt;
							func.apply(null, args);
						}, ucap);
					}
				});
			},
			create: function(stru){
				stru = stru.constructor === Array ? stru : jModifier.string.toElementArray(stru);
				let elements = jModifier.dom.createElements(stru);
				return elements.length > 1 ? elements : elements[0];
			},
			createElement: function(tagName, amt){
				let elements = [];
				for(let i = 0, amount = amt || 1; i < amount; i++) elements.push(document.createElement(tagName));
				return elements;
			},
			createElements: function(arr){
				let elements = [];
				for(let i = 0, aLength = arr.length; i < aLength; i++){
					let nodeStr = arr[i], tagStr = nodeStr[0], children = nodeStr[1], dupe = tagStr.split("*"), tag = dupe[0], amt = dupe[1] || 1,
					nodes = jModifier.dom.createElement(tag, amt);
					for(let n = 0, nodesLength = nodes.length; n < nodesLength; n++){
						let node = nodes[n];
						if(children){
							let childNodes = jModifier.dom.createElements(children);
							for(let e = 0, childNodesLength = childNodes.length; e < childNodesLength; e++) node.appendChild(childNodes[e]);
						}
						elements.push(node);
					}
				}
				return elements;
			},
			insertInto: function(target, e, position){
				e = e.constructor === Function && e.name === "handler" ? e[0] : e;
				target = target.constructor === Function && target.name === "handler" ? target.$ : target;
				let elements = jModifier.array.wrap(e);
				target = jModifier.dom.query(target, null, true)[0];
				position = target.children[position] || null;
				for(let i = 0, length = elements.length; i < length; i++) target.insertBefore(elements[i], position);
				return elements;
			}
		},
		"string": {
			toElementArray: function(str){
				str = str.constructor === RegExp ? str.source : str;
				str = str.replace(/\s/g, "");
				let seperate = function(node){
					let nl = node.length, io = node.indexOf("["), tag = io >= 0 ? node.substring(0, io) : node, children;
					if(io >= 0) children = node.substring(io + 1, nl -1);
					return children ? [tag, children] : [tag];
				},
				recursive = function(str){
					let ns = jModifier.string.splitFromXOutsideY(str, ",", "[]"), nodes = [];
					for(let i = 0, nsl = ns.length; i < nsl; i++){
						let sep = seperate(ns[i]), children = sep[1];
						if(children){
							sep[1] = recursive(children);
						}
						nodes.push(sep);
					}
					return nodes;
				};
				return recursive(str);
			},
			splitFromXOutsideY: function(str, X, Y){
				str = str.replace(/\s/g, "");
				let commas = [], nestPos = 0, split = [];
				for(let i = 0, sLength = str.length; i < sLength; i++){
					nestPos += str[i] === Y[0] ? 1 : str[i] === Y[1] ? -1 : 0;
					if(str[i] === X && nestPos === 0) commas.push(i);
				}
				let cLength = commas.length ? commas.length + 1 : 1;
				for(let i = 0; i < cLength; i++){
					let pos = commas[i], last = commas[i - 1] || 0;
					split.push(str.substring(last === 0 ? last : last + 1, pos));
				}
				return split;
			}
		},
		"object": {
			assign: function(obj, assignment, index, top, dupeIndex, arrayLength){
				if(!top) top = obj;
				let keys = Object.keys(assignment);
				for(let i = 0, length = keys.length; i < length; i++){
					let key = keys[i], val = assignment[key], cCon = val ? val.constructor : val, constName = cCon ? cCon.name : cCon, indx = !(isNaN(index));
					if(jModifier.object.NumStringBool[constName] || val === null || val === undefined){
						if(val !== undefined) obj[key] = val;
					}else{ 
						if(indx && jModifier.array.listy[constName]){
							index = dupeIndex !== undefined ? dupeIndex : index;
							if(val[index]) obj[key] = val[index];
						}else if(indx && cCon === Function && (val.name === "for" || val.name === "$")){
							if(dupeIndex) index = index - (dupeIndex * arrayLength);
							let returned = val(obj[key], index, top);
							if(returned || !isNaN(returned)) obj[key] = returned;
						}else if(cCon === Object){
							if(!obj[key]) obj[key] = {};
							jModifier.object.assign(obj[key], val, index, top, dupeIndex, arrayLength);
						}else{
							obj[key] = val;
						}
					}
				}
				return obj;
			},
			isType: function(trgt, type){
				for(let s = 0, length = type.length; s < length; s++) if(trgt.constructor === type[s]) return true;
				return false;
			},
			pathValue: function(trgt, path){
				path = path.constructor === Array ? path : path.split(".");
				let current;
				for(let i = 0; i < path.length; i++){
					current = current ? current[path[i]] : trgt[path[i]];
					if(!current) return null;
				}
				return current;
			},
			NumStringBool: {Number, String, Boolean}
		},
		"array": {
			assign: function(array, assignment, opts){
				array = array.constructor === String ? jModifier.dom.query(array, null, true) : array;
				jModifier.for(jModifier.array.wrap(array), function(item, index){
					jModifier.object.assign(item, assignment, index, null, (opts && opts.dupe) ? Math.floor(index / array.length) : undefined, array.length);
				}, opts);
				return array;
			},
			reverse: function(arr){
				let length = arr.length, newArr = [];
				for(let i = length - 1; i > -1; i--){
					newArr.push(arr[i]);
				}
				return newArr;
			},
			shuffle: function(arr){
				let a = [].concat(arr), length = a.length, shuffled = [];
				for(let i = 0; i < length; i++){
					let rand = Math.floor(Math.random() * a.length);
					shuffled.push(a[rand]);
					a.splice(a.indexOf(a[rand]), 1);
				}
				return shuffled;
			},
			sum: function(arr, stopPoint){
				let a = arr.slice(0, stopPoint || arr.length);
				return a.reduce(function(a, b){
					return a + b
				});
			},
			fill: function(arr, content){
				return arr.fill(undefined).map(function(a, b){return content || b});
			},
			wrap: function(trgt, Type){
				if(trgt) return jModifier.array.listy[trgt.constructor.name] ? trgt : new Array(typeof trgt === "number" ? trgt.toString() : trgt);
			},
			getIndex: function(arr, trgt){
				let length = arr.length;
				for(let i = 0; i < length; i++){
					if(arr[i] === trgt) return i;
				}
			},
			listy: {Array, Int8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, NodeList}
		},
		"function": {
			argumentEvaluator: function(table, func){
				return function(){
					let length = arguments.length, result = "";
					for(let i = 0; i < length; i++){
						let arg = arguments[i];
						result += func ? func(arg) || arg : arg;
					}
					let target = table[result] || table.else;
					if(target) return target.apply(null, arguments);
				}
			},
			getArguments: function(func){
				let funcStr = JSON.stringify("" + func), open = funcStr.indexOf("("), close = funcStr.indexOf(")"), refined = funcStr.substring(open + 1, close).replace(/\s/g, "").split(",");
				return refined;
			}
		},
		"alts": {
			q: "dom.query",
			on: "dom.on",
			d: "dom",
			o: "object",
			oa: "object.assign",
			a: "array",
			aa: "array.assign",
			for: "for"
		},
		log: false
	};
})();