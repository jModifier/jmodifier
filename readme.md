
![jModifier readme.md header](https://jmodifier.cd2.me/media/readme-header.png)

<p align="center">jModifier is a JavaScript utility library focused on the ability to easily query and manipulate Objects.<p>

</br>

[![jModifier Demonstration](https://jmodifier.cd2.me/media/jModifier-demonstration.gif)](https://jsfiddle.net/JeremyJaydan/rzx1z5p2/)
## Code behind the above demonstration:
```js
const $ = jModifier.getAlts();
const myElement = $.q("#my-element", {
    uls: "ul",
    items: "ul li"
});

$.aa(myElement.uls, {
    style: {
        transform: [16, 0, 24, 0].map(function(val) {
            return "translateY(" + val + "px)"
        })
    }
}, {
    interval: 80,
    loop: Infinity,
    dupe: 4
});

$.aa(myElement.items, {
    innerText: ["Hello,", "world", "this", "is", "jModifier!"],
    style: {
        background: ["#7986CB", "#64B5F6", "#4DB6AC", "#FFD54F", "#FF8A65"],
        textIndent: [32, 64, 16, 88, 0].map(function(val) {
            return val + "px"
        })
    }
}, {
    loop: Infinity,
    interval: 100,
    dupe: 5
});
```
</br>


|Question|Answer|
|:---|:---|
|What's the current version?|v0.1|
|jModifier stable?|Not yet!|
|What's the purpose?|Minimal methods with broad uses.|
|Is this a replacement for jQuery?|It's not, however it really depends on what you need done (it can be).|
|Can I get help?|Feel free to join my Discord server for help or general conversation: https://discord.gg/fHKgFSF|


</br>


Basic Concept
===

Most methods in jModifier are categorized and can be utilized under the following paths:

- `jModifier.dom`
- `jModifier.string`
- `jModifier.object`
- `jModifier.array`
- `jModifier.function`

</br>

Installing
===

1. Download/Copy the jModifier library into a file in your project with the extension `.js`
2. Reference the library with a script tag:
`<script type="text/javascript" src="/path/to/jModifier.js">`

Note: There is also an experimental version of jModifier under the `/dev` directory.

</br>

Table of Contents
===

|Method																			|Jump to																										| or Fiddle	
|:---																				|:---																												|:---				
|`jModifier.getAlts()`											|[#getalts](#getalts)																				|[x3bh6055](https://jsfiddle.net/JeremyJaydan/x3bh6055/)
|`jModifier.alts`														|[#alts](#alts)																							|
|`jModifier.for()`													|[#for](#for)																								|[cjpo7krj](https://jsfiddle.net/JeremyJaydan/cjpo7krj/)
|`jModifier.dom.query()`										|[#domquery](#domquery)																			|[e65rk4mj](https://jsfiddle.net/JeremyJaydan/e65rk4mj/)
|`jModifier.dom.on()`												|[#domon](#domon)																						|[7de3fp35](https://jsfiddle.net/JeremyJaydan/7de3fp35/)
|`jModifier.dom.create()`										|[#domcreate](#domcreate)																		|[ufqf8ery](https://jsfiddle.net/JeremyJaydan/ufqf8ery/)
|`jModifier.dom.createElement()`						|[#domcreateelement](#domcreateelement)											|[4rzam1nc](https://jsfiddle.net/JeremyJaydan/4rzam1nc/)
|`jModifier.dom.createElements()`						|[#domcreateelements](#domcreateelements)										|[s0z3cbvx](https://jsfiddle.net/JeremyJaydan/s0z3cbvx/)
|`jModifier.dom.insertInto()`								|[#dominsertinto](#dominsertinto)														|[gnr5q6y9](https://jsfiddle.net/JeremyJaydan/gnr5q6y9/)
|`jModifier.string.toNestedArray()`					|[#stringtonestedarray](#stringtonestedarray)								|[7m031cvb](https://jsfiddle.net/JeremyJaydan/7m031cvb/)
|`jModifier.string.splitFromXOutsideY()`		|[#stringsplitfromxoutsidey](#stringsplitfromxoutsidey)			|[ovs7Lh3u](https://jsfiddle.net/JeremyJaydan/ovs7Lh3u/)
|`jModifier.object.assign()`								|[#objectassign](#objectassign)															|[7udvLmyz](https://jsfiddle.net/JeremyJaydan/7udvLmyz/)
|`jModifier.object.isType()`								|[#objectistype](#objectistype)															|[2jm5jwrs](https://jsfiddle.net/JeremyJaydan/2jm5jwrs/)
|`jModifier.object.pathValue()`							|[#objectpathvalue](#objectpathvalue)												|[zct148bu](https://jsfiddle.net/JeremyJaydan/zct148bu/)
|`jModifier.object.NumStringBool`						|[#objectnumstringbool](#objectnumstringbool)								|
|`jModifier.array.assign()`									|[#arrayassign](#arrayassign)																|[gm58pyns](https://jsfiddle.net/JeremyJaydan/gm58pyns/)
|`jModifier.array.reverse()`								|[#arrayreverse](#arrayreverse)															|[p9n36zL0](https://jsfiddle.net/JeremyJaydan/p9n36zL0/)
|`jModifier.array.shuffle()`								|[#arrayshuffle](#arrayshuffle)															|[nsa4h11x](https://jsfiddle.net/JeremyJaydan/nsa4h11x/)
|`jModifier.array.sum()`										|[#arraysum](#arraysum)																			|[o5L8gvjv](https://jsfiddle.net/JeremyJaydan/o5L8gvjv/)
|`jModifier.array.fill()`										|[#arrayfill](#arrayfill)																		|[gbr7s0jv](https://jsfiddle.net/JeremyJaydan/gbr7s0jv/)
|`jModifier.array.wrap()`										|[#arraywrap](#arraywrap)																		|[qmj4c4Lm](https://jsfiddle.net/JeremyJaydan/qmj4c4Lm/)
|`jModifier.array.getIndex()`								|[#arraygetindex](#arraygetindex)														|[aeq1ybsf](https://jsfiddle.net/JeremyJaydan/aeq1ybsf/)
|`jModifier.array.listy`										|[#arraylisty](#arraylisty)																	|
|`jModifier.function.argumentEvaluator()`		|[#functionargumentevaluator](#functionargumentevaluator)		|[1hynpfhp](https://jsfiddle.net/JeremyJaydan/1hynpfhp/)
|`jModifier.function.getArguments()`				|[#functiongetarguments](#functiongetarguments)							|[8v2hLur9](https://jsfiddle.net/JeremyJaydan/8v2hLur9/)

</br>

Documentation
===

<img src="https://jmodifier.cd2.me/media/html-reference-and-usage-table.png"></img>

<!-- Keep below commented out MD for later use if need be -->
<!-- Reference HTML
```html
<div id="my-element">
    <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
    </ul>
    <ul>
        <li>Item 4</li>
        <li>Item 5</li>
        <li>Item 6</li>
    </ul>
</div>
``` -->
<!-- 
Argument Usage Table

|Indicator|Description|
|:---|---:|
|<...>|Type|
|(...)|Description|
| \| |"OR"|
|*|Required| -->

</br>










<!-- jModifier.getAlts() -->
# **.getAlts**

> <OBJECT>
Returns Object of specified or default alternate method paths.
```typescript
jModifier.getAlts(<Object(Method Paths)>)
```
**Utilizes**: [`jModifier.alts`](#alts), [`jModifier.object.pathValue`](#objectpathvalue)
> </OBJECT>


```js
// Default alternate paths
const $ = jModifier.getAlts();

console.log("Default: ", $);

// Custom alternate paths
const c = jModifier.getAlts({
    query: "dom.query",
    create: "dom.create"
});

console.log("Custom: ", c);
```


[**View on JSFiddle**](https://jsfiddle.net/JeremyJaydan/x3bh6055/)

---

</br>










<!-- jModifier.alts -->
# **.alts**

> <OBJECT>
Default alternate paths for [jModifier.getAlts()](#getalts).
```typescript
jModifier.alts
```
> </OBJECT>

---

</br>










<!-- jModifier.for() -->
# **.for**

> <OBJECT>
Similar to the native for loop. Has options argument for more control.
```typescript
jModifier.for(<Array|Number(Items)>*, <Function(Callback)>*, <Object(Options)>)
```
**Utilizes**: [`jModifier.array.fill`](#arrayfill), [`jModifier.array.reverse`](#arrayreverse), [`jModifier.array.shuffle`](#arrayshuffle), [`jModifier.array.sum`](#arraysum)
> </OBJECT>


```js
/* Example with number */
jModifier.for(10, function(item, index) {
    console.log(item + 1); // Counting down from 10
}, {
    reverse: true, // Starts in reverse since we're counting down
    interval: 1000, // 1000ms between each execution
    done: function() { // Executes after the loop completes
        console.log("O");
    }
});

/* Example with elements */
const myElements = jModifier.dom.query("li");
jModifier.for(myElements, function(item, index) {
    item.style.textIndent = "32px";
}, {
    interval: 2000
});

```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/cjpo7krj/)

|Current Options|Type|Default|
|---|---|---|
|interval|`Number` (ms)|0|
|reverse|`Boolean`|false|
|shuffle|`Boolean`|false|
|dupe|`Number`|0|
|delay|`Number` (ms)|0|
|loop|`Number` (including `Infinity`)|0|
|done|`Function`|null|

---

</br>










<!-- jModifier.dom.query() -->
# **.dom.query**

> <OBJECT>
You can easily query elements with this one however it works differently depending on how you use it.
```typescript
jModifier.dom.query(<Element|Array|String(Target|Parent)>*, <String(Child Target)>, <Boolean(Force Array)>)
```
**Utilizes**: [`jModifier.for`](#for), [`jModifier.array.wrap`](#arraywrap)
> </OBJECT>



```js
// Simple query
const myElement = jModifier.dom.query("#my-element");

// Query children of element
const childrenUL = jModifier.dom.query(myElement, "ul");

// Query multiple children of multiple elements and return in single Array
const childrenLI = jModifier.dom.query(childrenUL, "li");

// Query children and assign to returning object 
const childrenObj = jModifier.dom.query(myElement, {
    UL: "ul",
    LI: "ul li"
});
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/e65rk4mj/)

---

</br>










<!-- jModifier.dom.on() -->
# **.dom.on**

> <OBJECT>
Similar to `<Element>.addEventListener` however you can add multiple listeners to multiple elements with one simple function.
```typescript
jModifier.dom.on(<String|Element|Array(Target Element(s))>*, <Function(Callback & Events)>*, <Boolean(useCapture)>)
```
**Utilizes**: [`jModifier.function.getArguments`](#functiongetarguments), [`jModifier.dom.query`](#domquery), [`jModifier.for`](#for)
> </OBJECT>


```js
// First argument utilizes the .dom.query method therefore you can specify element(s)
// via a string, variable, array, etc.
jModifier.dom.on("#my-element ul li", function(element, mouseenter, click) {

    // First argument of the callback function returns an object that consists
    // of the elements, target index, and target element
    // {elements, index, node}

    // Specify the events after the first argument
    // (You can add as many events as you like)

    // Confused on how to handle multiple events?
    // That's super easy with the || operator
    let event = mouseenter || click;

    let rand = Math.floor(Math.random() * 255);
    element.node.style.background = "rgb(" + rand + ", " + rand + ", " + rand + ")";

});
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/7de3fp35/)

---

</br>










<!-- jModifier.dom.create() -->
# **.dom.create**

> <OBJECT>
Create multiple elements with a jModifier Nested Array String (`div[ul[li*6]]`).
```typescript
jModifier.dom.create(<String(jModifier Nested Array String)>*)
```
**Utilizes**: [`jModifier.string.toNestedArray`](#stringtonestedarray), [`jModifier.dom.createElements`](#domcreateelements)
> </OBJECT>


```js
// The below method will create the reference html
// structure using a jModifier Nested Array String.
const myElement = jModifier.dom.create("div[ul*2[li*3]]");
console.log(myElement);
// You can use other methods of jModifier such as array.assign
// to assign data to the elements once created.

// You can also use Regular Expression Objects. Because why not right?
console.log(jModifier.dom.create(/div*1000/));
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/ufqf8ery/)

---

</br>










<!-- jModifier.dom.createElement() -->
# **.dom.createElement**

> <OBJECT>
Create one or more elements easily.
```typescript
jModifier.dom.createElement(<String(Tag Name)>*, <Number(Amount)>)
```
> </OBJECT>


```js
// This one is for creating multiple elements but only of the same tag type.
const div2 = jModifier.dom.createElement("div", 2);
console.log(div2);

// Leave the second argument blank for only 1 element to be created & returned.
const small = jModifier.dom.createElement("small");
console.log(small);

// Note: This method always returns an Array
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/4rzam1nc/)

---

</br>










<!-- jModifier.dom.createElements() -->
# **.dom.createElements**

> <OBJECT>
Create multiple elements with a jModifier Nested Array (`[["div",[["ul",[["li*3"]]]]]]`).
```typescript
jModifier.dom.createElements(<Array(jModifier Nested Array String)>)
```
**Utilizes**: [`jModifier.dom.createElement`](#domcreateelement)
> </OBJECT>


```js
// .dom.createElements essentially works exactly the same way as .dom.create
// however it requires a "jModifier Nested Array" (NOT "jModifier Nested Array String")

// This one should be your go-to if you want even better performance.

const myElement = jModifier.dom.createElements([["div",[["ul*2",[["li*3"]]]]]]);
console.log(myElement[0]);

// [["div",[["ul*2",[["li*3"]]]]]]
// the above "jModifier Nested Array" is the 
// equivilent to the below "jModifier Nested Array String"
// div[ul*2[li*3]]
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/s0z3cbvx/)

---

</br>










<!-- jModifier.dom.insertInto() -->
# **.dom.insertInto**

> <OBJECT>
Similar to the native `<Element>.insertBefore()` however it works with multiple elements.
```typescript
jModifier.dom.insertInto(<String|Element(Target Parent)>*, <Element|Array(Target Element(s))>*, <Number(Position)>)
```
**Utilizes**: [`jModifier.array.wrap`](#arraywrap), [`jModifier.dom.query`](#domquery)
> </OBJECT>


```js
// Creating element to be inserted into the 1st UL
const newLI = document.createElement("li");
newLI.innerText = "Inserted Element #1";

// Inserting element #1
// The first argument utilizes the .dom.query method
jModifier.dom.insertInto("#my-element ul:nth-child(1)", newLI);
// if no position is specified, the element will be appended to the bottom.

// Creating element to be inserted into the 2nd UL
const newLI2 = document.createElement("li");
newLI2.innerText = "Inserted Element #2";

// You can specify a position with the third argument
jModifier.dom.insertInto("#my-element ul:nth-child(2)", newLI2, 1);
// 0 = before 1st item
// 1 = before 2nd item
// etc..

// Note: You can insert multiple elements and specify the position
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/gnr5q6y9/)

---

</br>










<!-- jModifier.string.toNestedArray() -->
# **.string.toNestedArray**

> <OBJECT>
This is the backbone of the dom element creation but it has many data structure uses.
```typescript
jModifier.string.toNestedArray(<String(jModifier Nested Array String)>*)
```
**Utilizes**: [`jModifier.string.splitFromXOutsideY`](#stringsplitfromxoutsidey)
> </OBJECT>


```js
// Alright this one may be a little confusing to understand.
// Bare with me!

// The best way I can explain this is to use element creation as an example.

// When creating multiple, nested elements, you want to specify the parent tag
// and the child tags and the child tags of the child tags. 

// So say if we want to create a div, a h1 inside that div,
// then another div a ul inside that with a li inside the ul..

console.log("Example: ",
    jModifier.string.toNestedArray("div[h1], div[ul[li]]")
); // output: [["div",[["h1"]]],["div",[["ul",[["li"]]]]]]

// You can use the output of this to create elements even faster with the 
// jModifier.dom.createElements() method

/* OUTPUT Explanation below */

// The way this works is that the jModifier Nested Array consists of two
// types of Arrays: "Tag Array" and "Child Array"

// The "Tag Array" holds 2 items: [tag, childArray]
// The "Child Array" holds infinite Tag Arrays: [ tagArray, tagArray, tagArray ]

// It starts with a Child Array
const nestedArray = [ // Start of Child Array
    [ // Start of Tag Array
        "Tag Array without children"
    ],
    [ // Start of Tag Array
        "Tag Array with children", [ // Start of Child Array
            [ // Start of Tag Array
                "Another tag array without children"
            ]
        ]
    ]
];

// Same example below as above (Might be easier to understand):
// [  [  "T1"  ], [  "T2", [  [  "C1"  ]  ]  ]  ]
// ^  ^           ^        ^  ^       
// ^  ^           ^        ^  Start of Tag Array 
// ^  ^           ^        ^
// ^  ^           ^        Start of Child Array
// ^  ^           ^        
// ^  ^           Start of Tag Array
// ^  ^           
// ^  Start of Tag Array
// ^
// Start of Child Array

// Disclaimer: "jModifier Nested Array" is just a name for convienient reference. I do not claim to be the first person to create this type of data structure.
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/7m031cvb/)

---

</br>










<!-- jModifier.string.splitFromXOutsideY() -->
# **.string.splitFromXOutsideY**

> <OBJECT>
Splits from x but not if x is within y.
```typescript
jModifier.string.splitFromXOutsideY(<String(Target)>*, <String(X)>*, <String(Y)>*, <Boolean(removeWhitespace)>)
```
> </OBJECT>


```js
// Similar to the native <String>.split() method
// however you can control where the split happens.
// (Specifically where the split does not happen)

// So for example if you wanted to split the below
// string by commas but not within the parentheses
const str = "ONE, TWO, THREE (1, 2, 3)";

// Your first argument would be your string, then the comma.
// Then for the third argument, you add the starting character
// and the ending character in the same string.
console.log(
    jModifier.string.splitFromXOutsideY(str, ",", "()")
); // output: ["ONE", " TWO", " THREE (1, 2, 3)"]

// If the fourth argument is true, the whitespace will be removed before returning
console.log(
    jModifier.string.splitFromXOutsideY(str, ",", "()", true)
); // output: ["ONE", "TWO", "THREE(1,2,3)"]
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/ovs7Lh3u/)

---

</br>










<!-- jModifier.object.assign() -->
# **.object.assign**

> <OBJECT>
Object assignment. Similar to the native mehod `Object.assign()`.
```typescript
jModifier.object.assign(<Object(Target)>*, <Object(Assignment)>*)
```
**Utilizes**: [`jModifier.object.NumStringBool`](#objectnumstringbool), [`jModifier.array.listy`](#arraylisty)
> </OBJECT>


```js
const myElement = jModifier.dom.query("#my-element");

// This method works similar to the native Object.assign() although
// it does not assign in "one hit", it assigns recursively.

jModifier.object.assign(myElement, {
    style: {
        background: "red"
    }
});

// In the above, jModifier gets the style property of myElement
// then recursively assigns to the property.


/* Example with plain Object */
const myObject = {
    one: 1,
    two: 2,
    three: {
        four: {
            five: 5
        }
    }
};

jModifier.object.assign(myObject, {
    one: 100,
    three: {
        four: {
            five: 500
        },
        addedKey: "hello, world"
    }
});

console.log(
    myObject
);

/* output: 
{
    "one": 100,
    "two": 2,
    "three": {
        "four": {
            "five": 500
        },
        "addedKey": "hello, world"
    }
}
 */
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/7udvLmyz/)

---

</br>










<!-- jModifier.object.isType() -->
# **.object.isType**

> <OBJECT>
Check target if target is of a certain types.
```typescript
jModifier.object.isType(<Any(Target)>*, <Array(Types)>*)
```
> </OBJECT>


```js
// This method uses the constructor of the specified first
// argument against each specified item in the 2nd argument Array

console.log("Is Object, String, or function: ",
    jModifier.object.isType({}, [Object, String, Function])
); // output: true

console.log("Is String or Object: ",
    jModifier.object.isType([], [String, Object])
); // output: false

// If the specified item matches the type of any of the specified items in the Array, it will result in true.
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/2jm5jwrs/)

---

</br>








<!-- jModifier.object.pathValue() -->
# **.object.pathValue**

> <OBJECT>
Target and return the value of an Object path.
```typescript
jModifier.object.pathValue(<Object(Target)>*, <String(Path)>*)
```
> </OBJECT>


```js
// Pretty simple one
const myObject = {
    this: {
        is: {
            a: "Object!"
        }
    }
};

console.log("Returns path value: ",
    jModifier.object.pathValue(myObject, "this.is.a")
); // output: "Object!"

```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/zct148bu/)

---

</br>










<!-- jModifier.object.NumStringBool -->
# **.object.NumStringBool**

> <OBJECT>
Simply an Object that consists of `{Number, String, Boolean}`.
```typescript
jModifier.object.NumStringBool
```
> </OBJECT>

---

</br>










<!-- jModifier.array.assign() -->
# **.array.assign**

> <OBJECT>
Assignment for Object(s) within Array(s) (Inherits [`.for`](#for) options).
```typescript
jModifier.array.assign(<Array(Target Array)>*, <Object(Assignment)>*, <Object(Options)>)
```
**Utilizes**: [`jModifier.dom.query`](#domquery), [`jModifier.for`](#for), [`jModifier.array.wrap`](#arraywrap), [`jModifier.object.assign`](#objectassign)
> </OBJECT>


```js
// .array.assign is basically .for & .object.assign combined.

// Works great with elements:
const listItems = jModifier.dom.query("#my-element ul li");
jModifier.array.assign(listItems, {
    innerText: "hello, world"
}, {
    delay: 1000
});

/* Property Assignment With $ Functions */
// If a function name within an array assignment is equal to "$"
// the function will evaluate and return with "originalValue, index, and item"
// (Make sure to return inside the $ functions)
jModifier.array.assign(listItems, {
    innerText: function $(originalValue, index, item) {
        return originalValue + " " + (index + 1)
    }
}, {
    delay: 2000,
    interval: 300
});

/* Property Assignment With Arrays */
// Instead of using $ functions, you can also use Arrays
// The each item in the Array will assign to the relative index
jModifier.array.assign(listItems, {
    innerText: ["one", "two", null, "four", "five", null]
        // use "null" to skip item assignment
        // (however the interval still counts the skipped time)
}, {
    delay: 3800,
    interval: 300
});

/* Property Assignment With Arrays + Duplication */
// With duplication, the property Array assigns the first item
// to each of the elements then 2nd Array item, 3rd, etc.. (to the dupe number)
jModifier.array.assign(listItems, {
    innerText: ["THREE", "TWO", "ONE", "HAPPY NEW YEAR!!"]
}, {
    delay: 5000,
    interval: 100,
    dupe: 4
});

/* Using loop option */
jModifier.array.assign(listItems, {
    style: {
        textIndent: ["32px", "0px", "64px", "0px"]
    }
}, {
    delay: 7000,
    interval: 30,
    dupe: 4,
    loop: Infinity
})
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/gm58pyns/)

---

</br>










<!-- jModifier.array.reverse() -->
# **.array.reverse**

> <OBJECT>
Returns given Array backwards.
```typescript
jModifier.array.reverse(<Array(Target)>*)
```
> </OBJECT>


```js
const myArray = [1, 2, 3];
console.log(
    jModifier.array.reverse(myArray)
); // output: [3, 2, 1]
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/p9n36zL0/)

---

</br>










<!-- jModifier.array.shuffle() -->
# **.array.shuffle**

> <OBJECT>
Returns given Array shuffled.
```typescript
jModifier.array.shuffle(<Array(Target)>*)
```
> </OBJECT>


```js
const myArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
console.log(
    jModifier.array.shuffle(myArray)
); // output: (view console on jsfiddle)
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/nsa4h11x/)

---

</br>










<!-- jModifier.array.sum() -->
# **.array.sum**

> <OBJECT>
Sums up given array to stop point and returns result.
```typescript
jModifier.array.sum(<Array(Target)>*, <Number(Stop Point)>*)
```
> </OBJECT>


```js
const myArray = [1, 2, 3];

console.log("Without stop point: ",
    jModifier.array.sum(myArray)
); // output: 6

console.log("With stop point: ",
    jModifier.array.sum(myArray, 2)
); // output: 3
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/o5L8gvjv/)

---

</br>










<!-- jModifier.array.fill() -->
# **.array.fill**

> <OBJECT>
Fills and returns given Array with specified content.
```typescript
jModifier.array.fill(<Array(Target)>*, <Any(Content)>*)
```
> </OBJECT>

```js
// If no content is specified (2nd argument), it will return with
// each item as a number starting from 0
console.log(
    jModifier.array.fill(new Array(5))
); // output: [0, 1, 2, 3, 4]

// With content:
console.log(
    jModifier.array.fill(new Array(3), "foo")
); // output: ["foo", "foo", "foo"]

// Keep in mind, the above does not assign, only returns!
```

[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/gbr7s0jv/)

---

</br>










<!-- jModifier.array.wrap() -->
# **.array.wrap**

> <OBJECT>
Wraps given argument in Array if not Array already.
```typescript
jModifier.array.wrap(<Any(Target)>*)
```
**Utilizes**: [jModifier.array.listy](#arraylisty)
> </OBJECT>


```js
// .array.wrap is useful for when you don't know whether
// an incoming variable is an Array or not

const notArray = "foo";
const isArray = ["bar"];

console.log(
    jModifier.array.wrap(notArray)
); // output: ["foo"]

console.log(
    jModifier.array.wrap(isArray)
); // output: ["bar"]

// (Always returns as array)
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/qmj4c4Lm/)

---

</br>










<!-- jModifier.array.getIndex() -->
# **.array.getIndex**

> <OBJECT>
Gets index of item within given Array.
```typescript
jModifier.array.getIndex(<Array(Target)>*, <Any(Item)>*)
```
> </OBJECT>


```js
// Useful for getting the index of an element within an Array
const listItems = jModifier.dom.query("#my-element ul li");
const listItem = jModifier.dom.query("#my-element ul:nth-child(1) li:nth-child(3)");

console.log(
    jModifier.array.getIndex(listItems, listItem) // (3rd item)
); // output: 2
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/aeq1ybsf/)

---

</br>










<!-- jModifier.array.listy -->
# **.array.listy**

> <OBJECT>
Simply an Object that consists of list style type Objects. Add your custom Array to this Object for other jModifier method compatibility.
```typescript
jModifier.listy
```
> </OBJECT>

---

</br>










<!-- jModifier.function.argumentEvaluator() -->
# **.function.argumentEvaluator**

> <OBJECT>
Create a table of functions that get evaluated when executed depending on the manipulation function
```typescript
jModifier.function.argumentEvaluator(<Object(Table)>*, <Function(Manipulation)>)
```
> </OBJECT>


```js
// The argumentEvaluator method is a great way
// to avoid using multiple if else statements
const evaluator = jModifier.function.argumentEvaluator({
    "1:2:3": function() { // make sure to add the colon to seperate arguments
        return "123!";
    },
    "4:5:6": function() {
        return "456!";
    }
});

console.log(
    evaluator(1, 2, 3)
); // output: "123!"

console.log(
    evaluator(4, 5, 6)
); // output: "456!"

/* Example with argument manipulation */
const evaluatorWAM = jModifier.function.argumentEvaluator({
    "Number:String:Number": function() {
        return "Number String Number!";
    },
    "Object:Object:Object": function() {
        return "3x Object!";
    }
}, function(value) {
    // The below returns the constructor name which if 
    // matches a function in the above table,
    // it will execute said function
    return value.constructor.name
});

console.log(
    evaluatorWAM(1, "o", 1)
); // output: "Number String Number!"

console.log(
    evaluatorWAM({}, {}, {})
) // output: "3x Object!"
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/1hynpfhp/)

---

</br>










<!-- jModifier.function.getArguments() -->
# **.function.getArguments**

> <OBJECT>
Returns arguments of given Function
```typescript
jModifier.function.getArguments(<Function(Target)>)
```
> </OBJECT>


```js
function foo(one, two, three) {}

console.log(
    jModifier.function.getArguments(foo)
); // output: ["one", "two", "three"]
```


[View on JSFiddle](https://jsfiddle.net/JeremyJaydan/8v2hLur9/)

---

</br>