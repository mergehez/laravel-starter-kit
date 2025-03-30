'use strict';

import plugin from "tailwindcss/plugin";
import node_fs from "node:fs";

const defaultIconDimensions = Object.freeze(
  {
    left: 0,
    top: 0,
    width: 16,
    height: 16
  }
);
const defaultIconTransformations = Object.freeze({
  rotate: 0,
  vFlip: false,
  hFlip: false
});
const defaultIconProps = Object.freeze({
  ...defaultIconDimensions,
  ...defaultIconTransformations
});
const defaultExtendedIconProps = Object.freeze({
  ...defaultIconProps,
  body: "",
  hidden: false
});

function mergeIconTransformations(obj1, obj2) {
  const result = {};
  if (!obj1.hFlip !== !obj2.hFlip) {
    result.hFlip = true;
  }
  if (!obj1.vFlip !== !obj2.vFlip) {
    result.vFlip = true;
  }
  const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
  if (rotate) {
    result.rotate = rotate;
  }
  return result;
}

function mergeIconData(parent, child) {
  const result = mergeIconTransformations(parent, child);
  for (const key in defaultExtendedIconProps) {
    if (key in defaultIconTransformations) {
      if (key in parent && !(key in result)) {
        result[key] = defaultIconTransformations[key];
      }
    } else if (key in child) {
      result[key] = child[key];
    } else if (key in parent) {
      result[key] = parent[key];
    }
  }
  return result;
}

function getIconsTree(data, names) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  const resolved = /* @__PURE__ */ Object.create(null);
  function resolve(name) {
    if (icons[name]) {
      return resolved[name] = [];
    }
    if (!(name in resolved)) {
      resolved[name] = null;
      const parent = aliases[name] && aliases[name].parent;
      const value = parent && resolve(parent);
      if (value) {
        resolved[name] = [parent].concat(value);
      }
    }
    return resolved[name];
  }
  (names || Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
  return resolved;
}

function internalGetIconData(data, name, tree) {
  const icons = data.icons;
  const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
  let currentProps = {};
  function parse(name2) {
    currentProps = mergeIconData(
      icons[name2] || aliases[name2],
      currentProps
    );
  }
  parse(name);
  tree.forEach(parse);
  return mergeIconData(data, currentProps);
}
function getIconData(data, name) {
  if (data.icons[name]) {
    return internalGetIconData(data, name, []);
  }
  const tree = getIconsTree(data, [name])[name];
  return tree ? internalGetIconData(data, name, tree) : null;
}

function iconToHTML(body, attributes) {
  let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
  for (const attr in attributes) {
    renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
  }
  return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
}

const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
function calculateSize(size, ratio, precision) {
  if (ratio === 1) {
    return size;
  }
  precision = precision || 100;
  if (typeof size === "number") {
    return Math.ceil(size * ratio * precision) / precision;
  }
  if (typeof size !== "string") {
    return size;
  }
  const oldParts = size.split(unitsSplit);
  if (oldParts === null || !oldParts.length) {
    return size;
  }
  const newParts = [];
  let code = oldParts.shift();
  let isNumber = unitsTest.test(code);
  while (true) {
    if (isNumber) {
      const num = parseFloat(code);
      if (isNaN(num)) {
        newParts.push(code);
      } else {
        newParts.push(Math.ceil(num * ratio * precision) / precision);
      }
    } else {
      newParts.push(code);
    }
    code = oldParts.shift();
    if (code === void 0) {
      return newParts.join("");
    }
    isNumber = !isNumber;
  }
}

function encodeSVGforURL(svg) {
  return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
}
function svgToData(svg) {
  return "data:image/svg+xml," + encodeSVGforURL(svg);
}
function svgToURL(svg) {
  return 'url("' + svgToData(svg) + '")';
}

function makeViewBoxSquare(viewBox) {
  const [left, top, width, height] = viewBox;
  if (width !== height) {
    const max = Math.max(width, height);
    return [left - (max - width) / 2, top - (max - height) / 2, max, max];
  }
  return viewBox;
}

const defaultIconSizeCustomisations = Object.freeze({
  width: null,
  height: null
});
const defaultIconCustomisations = Object.freeze({
  // Dimensions
  ...defaultIconSizeCustomisations,
  // Transformations
  ...defaultIconTransformations
});

function splitSVGDefs(content, tag = "defs") {
  let defs = "";
  const index = content.indexOf("<" + tag);
  while (index >= 0) {
    const start = content.indexOf(">", index);
    const end = content.indexOf("</" + tag);
    if (start === -1 || end === -1) {
      break;
    }
    const endEnd = content.indexOf(">", end);
    if (endEnd === -1) {
      break;
    }
    defs += content.slice(start + 1, end).trim();
    content = content.slice(0, index).trim() + content.slice(endEnd + 1);
  }
  return {
    defs,
    content
  };
}
function mergeDefsAndContent(defs, content) {
  return defs ? "<defs>" + defs + "</defs>" + content : content;
}
function wrapSVGContent(body, start, end) {
  const split = splitSVGDefs(body);
  return mergeDefsAndContent(split.defs, start + split.content + end);
}

const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
function iconToSVG(icon, customisations) {
  const fullIcon = {
    ...defaultIconProps,
    ...icon
  };
  const fullCustomisations = {
    ...defaultIconCustomisations,
    ...customisations
  };
  const box = {
    left: fullIcon.left,
    top: fullIcon.top,
    width: fullIcon.width,
    height: fullIcon.height
  };
  let body = fullIcon.body;
  [fullIcon, fullCustomisations].forEach((props) => {
    const transformations = [];
    const hFlip = props.hFlip;
    const vFlip = props.vFlip;
    let rotation = props.rotate;
    if (hFlip) {
      if (vFlip) {
        rotation += 2;
      } else {
        transformations.push(
          "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
        );
        transformations.push("scale(-1 1)");
        box.top = box.left = 0;
      }
    } else if (vFlip) {
      transformations.push(
        "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
      );
      transformations.push("scale(1 -1)");
      box.top = box.left = 0;
    }
    let tempValue;
    if (rotation < 0) {
      rotation -= Math.floor(rotation / 4) * 4;
    }
    rotation = rotation % 4;
    switch (rotation) {
      case 1:
        tempValue = box.height / 2 + box.top;
        transformations.unshift(
          "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
        );
        break;
      case 2:
        transformations.unshift(
          "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
        );
        break;
      case 3:
        tempValue = box.width / 2 + box.left;
        transformations.unshift(
          "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
        );
        break;
    }
    if (rotation % 2 === 1) {
      if (box.left !== box.top) {
        tempValue = box.left;
        box.left = box.top;
        box.top = tempValue;
      }
      if (box.width !== box.height) {
        tempValue = box.width;
        box.width = box.height;
        box.height = tempValue;
      }
    }
    if (transformations.length) {
      body = wrapSVGContent(
        body,
        '<g transform="' + transformations.join(" ") + '">',
        "</g>"
      );
    }
  });
  const customisationsWidth = fullCustomisations.width;
  const customisationsHeight = fullCustomisations.height;
  const boxWidth = box.width;
  const boxHeight = box.height;
  let width;
  let height;
  if (customisationsWidth === null) {
    height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
    width = calculateSize(height, boxWidth / boxHeight);
  } else {
    width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
    height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
  }
  const attributes = {};
  const setAttr = (prop, value) => {
    if (!isUnsetKeyword(value)) {
      attributes[prop] = value.toString();
    }
  };
  setAttr("width", width);
  setAttr("height", height);
  const viewBox = [box.left, box.top, boxWidth, boxHeight];
  attributes.viewBox = viewBox.join(" ");
  return {
    attributes,
    viewBox,
    body
  };
}

function getCommonCSSRules(options) {
  const result = {
    display: "inline-block",
    width: "1em",
    height: "1em"
  };
  const varName = options.varName;
  if (options.pseudoSelector) {
    result["content"] = "''";
  }
  switch (options.mode) {
    case "background":
      if (varName) {
        result["background-image"] = "var(--" + varName + ")";
      }
      result["background-repeat"] = "no-repeat";
      result["background-size"] = "100% 100%";
      break;
    case "mask":
      result["background-color"] = "currentColor";
      if (varName) {
        result["mask-image"] = result["-webkit-mask-image"] = "var(--" + varName + ")";
      }
      result["mask-repeat"] = result["-webkit-mask-repeat"] = "no-repeat";
      result["mask-size"] = result["-webkit-mask-size"] = "100% 100%";
      break;
  }
  return result;
}
function generateItemCSSRules(icon, options) {
  const result = {};
  const varName = options.varName;
  const buildResult = iconToSVG(icon);
  let viewBox = buildResult.viewBox;
  if (viewBox[2] !== viewBox[3]) {
    if (options.forceSquare) {
      viewBox = makeViewBoxSquare(viewBox);
    } else {
      result["width"] = calculateSize("1em", viewBox[2] / viewBox[3]);
    }
  }
  const svg = iconToHTML(
    buildResult.body.replace(/currentColor/g, options.color || "black"),
    {
      viewBox: `${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`,
      width: `${viewBox[2]}`,
      height: `${viewBox[3]}`
    }
  );
  const url = svgToURL(svg);
  if (varName) {
    result["--" + varName] = url;
  } else {
    switch (options.mode) {
      case "background":
        result["background-image"] = url;
        break;
      case "mask":
        result["mask-image"] = result["-webkit-mask-image"] = url;
        break;
    }
  }
  return result;
}

const commonSelector = ".icon--{prefix}";
const iconSelector = ".icon--{prefix}--{name}";
const defaultSelectors = {
  commonSelector,
  iconSelector,
  overrideSelector: commonSelector + iconSelector
};
function getIconsCSSData(iconSet, names, options = {}) {
  const css = [];
  const errors = [];
  const palette = options.color ? true : void 0;
  let mode = options.mode || typeof palette === "boolean" && (palette ? "background" : "mask");
  if (!mode) {
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const icon = getIconData(iconSet, name);
      if (icon) {
        const body = options.customise ? options.customise(icon.body, name) : icon.body;
        mode = body.includes("currentColor") ? "mask" : "background";
        break;
      }
    }
    if (!mode) {
      mode = "mask";
      errors.push(
        "/* cannot detect icon mode: not set in options and icon set is missing info, rendering as " + mode + " */"
      );
    }
  }
  let varName = options.varName;
  if (varName === void 0 && mode === "mask") {
    varName = "svg";
  }
  const newOptions = {
    ...options,
    // Override mode and varName
    mode,
    varName
  };
  const { commonSelector: commonSelector2, iconSelector: iconSelector2, overrideSelector } = newOptions.iconSelector ? newOptions : defaultSelectors;
  const iconSelectorWithPrefix = iconSelector2.replace(
    /{prefix}/g,
    iconSet.prefix
  );
  const commonRules = {
    ...options.rules,
    ...getCommonCSSRules(newOptions)
  };
  const hasCommonRules = commonSelector2 && commonSelector2 !== iconSelector2;
  const commonSelectors = /* @__PURE__ */ new Set();
  if (hasCommonRules) {
    css.push({
      selector: commonSelector2.replace(/{prefix}/g, iconSet.prefix),
      rules: commonRules
    });
  }
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const iconData = getIconData(iconSet, name);
    if (!iconData) {
      errors.push("/* Could not find icon: " + name + " */");
      continue;
    }
    const body = options.customise ? options.customise(iconData.body, name) : iconData.body;
    const rules = generateItemCSSRules(
      {
        ...defaultIconProps,
        ...iconData,
        body
      },
      newOptions
    );
    let requiresOverride = false;
    if (hasCommonRules && overrideSelector) {
      for (const key in rules) {
        if (key in commonRules) {
          requiresOverride = true;
        }
      }
    }
    const selector = (requiresOverride && overrideSelector ? overrideSelector.replace(/{prefix}/g, iconSet.prefix) : iconSelectorWithPrefix).replace(/{name}/g, name);
    css.push({
      selector,
      rules
    });
    if (!hasCommonRules) {
      commonSelectors.add(selector);
    }
  }
  const result = {
    css,
    errors
  };
  if (!hasCommonRules && commonSelectors.size) {
    const selector = Array.from(commonSelectors).join(
      newOptions.format === "compressed" ? "," : ", "
    );
    result.common = {
      selector,
      rules: commonRules
    };
  }
  return result;
}

const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function locateIconSet(prefix) {
    // Try `@iconify-json/{$prefix}`
    try {
        const main = require.resolve(`@iconify-json/${prefix}/icons.json`);
        const info = require.resolve(`@iconify-json/${prefix}/info.json`);
        return {
            main,
            info,
        };
    }
    catch {
        //
    }
    // Try `@iconify/json`
    try {
        const main = require.resolve(`@iconify/json/json/${prefix}.json`);
        return {
            main,
        };
    }
    catch {
        //
    }
}
/**
 * Cache for loaded icon sets
 *
 * Tailwind CSS can send multiple separate requests to plugin, this will
 * prevent same data from being loaded multiple times.
 *
 * Key is filename, not prefix!
 */
const cache = Object.create(null);
/**
 * Load icon set from file
 */
function loadIconSetFromFile(source) {
    try {
        const result = JSON.parse(node_fs.readFileSync(source.main, 'utf8'));
        if (!result.info && source.info) {
            // Load info from a separate file
            result.info = JSON.parse(node_fs.readFileSync(source.info, 'utf8'));
        }
        return result;
    }
    catch {
        //
    }
}
/**
 * Load icon set from source
 */
function loadIconSet(source) {
    if (typeof source === 'function') {
        // Callback
        return source();
    }
    if (typeof source === 'object') {
        // IconifyJSON
        return source;
    }
    // String
    // Try to parse JSON
    if (source.startsWith('{')) {
        try {
            return JSON.parse(source);
        }
        catch {
            // Invalid JSON
        }
    }
    // Check for cache
    if (cache[source]) {
        return cache[source];
    }
    // Icon set prefix
    if (source.match(matchIconName)) {
        const filename = locateIconSet(source);
        if (filename) {
            // Load icon set
            const result = loadIconSetFromFile(filename);
            if (result) {
                cache[source] = result;
            }
            return result;
        }
    }
    // Filename
    const result = loadIconSetFromFile({
        main: source,
    });
    if (result) {
        cache[source] = result;
    }
    return result;
}
/**
 * Get dynamic CSS rules
 */
function getDynamicCSSRules(icon, options = {}) {
    const nameParts = icon.split(/--|:/);
    if (nameParts.length !== 2) {
        throw new Error(`Invalid icon name: "${icon}"`);
    }
    const [prefix, name] = nameParts;
    if (!(prefix.match(matchIconName) && name.match(matchIconName))) {
        throw new Error(`Invalid icon name: "${icon}"`);
    }
    const iconSet = loadIconSet(options.iconSets?.[prefix] || prefix);
    if (!iconSet) {
        throw new Error(`Cannot load icon set for "${prefix}". Install "@iconify-json/${prefix}" as dev dependency?`);
    }
    const generated = getIconsCSSData(iconSet, [name], {
        iconSelector: '.icon',
        customise: (content, name) => options.customise?.(content, name, prefix) ?? content,
    });
    if (generated.css.length !== 1) {
        throw new Error(`Cannot find "${icon}". Bad icon name?`);
    }
    const scale = options.scale ?? 1;
    if (scale) {
        generated.common.rules.height = scale + 'em';
        generated.common.rules.width = scale + 'em';
    }
    else {
        delete generated.common.rules.height;
        delete generated.common.rules.width;
    }
    return {
        // Common rules
        ...(options.overrideOnly || !generated.common?.rules
            ? {}
            : generated.common.rules),
        // Icon rules
        ...generated.css[0].rules,
    };
}
/**
 * Generate styles for dynamic selector
 *
 * Usage in HTML: <span class="icon-mdi-light--home" />
 */
function addDynamicIconSelectors(options) {
    const prefix = options?.prefix || 'icon';
    const target = {};

    const handler = {
      get(target, prop, receiver) {
        if(!prop.includes('--'))
          return undefined;
        if(prop.startsWith('-'))
          prop = prop.substring(1);
         // console.log('iv-get', prop)
        if(prop.startsWith('['))
          prop = prop.substring(1);
        if(prop.endsWith(']'))
            prop = prop.substring(0, prop.length - 1);
        return prop;
      }
    };
    return plugin(({ matchComponents }) => {
      matchComponents({
        [prefix]: (icon,a) => {
          try {
            return getDynamicCSSRules(icon, options);
          }
          catch (err) {
            // Log error, but do not throw it
            console.error(err.message);
          }
        },
      }, {
        //modifiers: 'any',
        values: new Proxy(target, handler)
      })
    });
}
exports.addDynamicIconSelectors = addDynamicIconSelectors;
