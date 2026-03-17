import { t as typeHandlers, a as types, A as AstroError, N as NoImageMetadata, F as FailedToFetchRemoteImageDimensions, R as RemoteImageNotAllowed, I as InvalidComponentArgs, c as createRenderInstruction, b as addAttribute, r as renderTemplate, E as ExpectedImage, L as LocalImageUsedWrongly, M as MissingImageDimension, U as UnsupportedImageFormat, d as IncompatibleDescriptorOptions, e as UnsupportedImageConversion, f as ExpectedImageOptions, g as ExpectedNotESMImage, h as InvalidImageService, i as ImageMissingAlt, m as maybeRenderHead, s as spreadAttributes, j as FontFamilyNotFound, u as unescapeHTML, k as generateCspDigest, l as renderComponent, n as renderHead, o as renderSlot } from './prerender_Xzlrje07.mjs';
import 'piccolore';
import 'clsx';
import { joinPaths, isRemotePath } from '@astrojs/internal-helpers/path';
import { isRemoteAllowed } from '@astrojs/internal-helpers/remote';
import * as mime from 'mrmime';

function isESMImportedImage(src) {
  return typeof src === "object" || typeof src === "function" && "src" in src;
}
function isRemoteImage(src) {
  return typeof src === "string";
}
async function resolveSrc(src) {
  if (typeof src === "object" && "then" in src) {
    const resource = await src;
    return resource.default ?? resource;
  }
  return src;
}

const firstBytes = /* @__PURE__ */ new Map([
  [0, "heif"],
  [56, "psd"],
  [66, "bmp"],
  [68, "dds"],
  [71, "gif"],
  [73, "tiff"],
  [77, "tiff"],
  [82, "webp"],
  [105, "icns"],
  [137, "png"],
  [255, "jpg"]
]);
function detector(input) {
  const byte = input[0];
  const type = firstBytes.get(byte);
  if (type && typeHandlers.get(type).validate(input)) {
    return type;
  }
  return types.find((imageType) => typeHandlers.get(imageType).validate(input));
}

function lookup(input) {
  const type = detector(input);
  if (typeof type !== "undefined") {
    const size = typeHandlers.get(type).calculate(input);
    if (size !== void 0) {
      size.type = size.type ?? type;
      return size;
    }
  }
  throw new TypeError("unsupported file type: " + type);
}

async function imageMetadata(data, src) {
  let result;
  try {
    result = lookup(data);
  } catch {
    throw new AstroError({
      ...NoImageMetadata,
      message: NoImageMetadata.message(src)
    });
  }
  if (!result.height || !result.width || !result.type) {
    throw new AstroError({
      ...NoImageMetadata,
      message: NoImageMetadata.message(src)
    });
  }
  const { width, height, type, orientation } = result;
  const isPortrait = (orientation || 0) >= 5;
  return {
    width: isPortrait ? height : width,
    height: isPortrait ? width : height,
    format: type,
    orientation
  };
}

async function inferRemoteSize(url, imageConfig) {
  if (!URL.canParse(url)) {
    throw new AstroError({
      ...FailedToFetchRemoteImageDimensions,
      message: FailedToFetchRemoteImageDimensions.message(url)
    });
  }
  const allowlistConfig = imageConfig ? {
    domains: imageConfig.domains ?? [],
    remotePatterns: imageConfig.remotePatterns ?? []
  } : void 0;
  if (!allowlistConfig) {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new AstroError({
        ...FailedToFetchRemoteImageDimensions,
        message: FailedToFetchRemoteImageDimensions.message(url)
      });
    }
  }
  if (allowlistConfig && !isRemoteAllowed(url, allowlistConfig)) {
    throw new AstroError({
      ...RemoteImageNotAllowed,
      message: RemoteImageNotAllowed.message(url)
    });
  }
  const response = await fetch(url, { redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    throw new AstroError({
      ...FailedToFetchRemoteImageDimensions,
      message: FailedToFetchRemoteImageDimensions.message(url)
    });
  }
  if (!response.body || !response.ok) {
    throw new AstroError({
      ...FailedToFetchRemoteImageDimensions,
      message: FailedToFetchRemoteImageDimensions.message(url)
    });
  }
  const reader = response.body.getReader();
  let done, value;
  let accumulatedChunks = new Uint8Array();
  while (!done) {
    const readResult = await reader.read();
    done = readResult.done;
    if (done) break;
    if (readResult.value) {
      value = readResult.value;
      let tmp = new Uint8Array(accumulatedChunks.length + value.length);
      tmp.set(accumulatedChunks, 0);
      tmp.set(value, accumulatedChunks.length);
      accumulatedChunks = tmp;
      try {
        const dimensions = await imageMetadata(accumulatedChunks, url);
        if (dimensions) {
          await reader.cancel();
          return dimensions;
        }
      } catch {
      }
    }
  }
  throw new AstroError({
    ...NoImageMetadata,
    message: NoImageMetadata.message(url)
  });
}

function validateArgs(args) {
  if (args.length !== 3) return false;
  if (!args[0] || typeof args[0] !== "object") return false;
  return true;
}
function baseCreateComponent(cb, moduleId, propagation) {
  const name = moduleId?.split("/").pop()?.replace(".astro", "") ?? "";
  const fn = (...args) => {
    if (!validateArgs(args)) {
      throw new AstroError({
        ...InvalidComponentArgs,
        message: InvalidComponentArgs.message(name)
      });
    }
    return cb(...args);
  };
  Object.defineProperty(fn, "name", { value: name, writable: false });
  fn.isAstroComponentFactory = true;
  fn.moduleId = moduleId;
  fn.propagation = propagation;
  return fn;
}
function createComponentWithOptions(opts) {
  const cb = baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
  return cb;
}
function createComponent(arg1, moduleId, propagation) {
  if (typeof arg1 === "function") {
    return baseCreateComponent(arg1, moduleId, propagation);
  } else {
    return createComponentWithOptions(arg1);
  }
}

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "C:/Users/adaredu/Documents/densora/adardev/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/adaredu/Documents/densora/adardev/node_modules/astro/components/ClientRouter.astro", void 0);

const VALID_SUPPORTED_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "tiff",
  "webp",
  "gif",
  "svg",
  "avif"
];
const DEFAULT_OUTPUT_FORMAT = "webp";
const DEFAULT_HASH_PROPS = [
  "src",
  "width",
  "height",
  "format",
  "quality",
  "fit",
  "position",
  "background"
];

const DEFAULT_RESOLUTIONS = [
  640,
  // older and lower-end phones
  750,
  // iPhone 6-8
  828,
  // iPhone XR/11
  960,
  // older horizontal phones
  1080,
  // iPhone 6-8 Plus
  1280,
  // 720p
  1668,
  // Various iPads
  1920,
  // 1080p
  2048,
  // QXGA
  2560,
  // WQXGA
  3200,
  // QHD+
  3840,
  // 4K
  4480,
  // 4.5K
  5120,
  // 5K
  6016
  // 6K
];
const LIMITED_RESOLUTIONS = [
  640,
  // older and lower-end phones
  750,
  // iPhone 6-8
  828,
  // iPhone XR/11
  1080,
  // iPhone 6-8 Plus
  1280,
  // 720p
  1668,
  // Various iPads
  2048,
  // QXGA
  2560
  // WQXGA
];
const getWidths = ({
  width,
  layout,
  breakpoints = DEFAULT_RESOLUTIONS,
  originalWidth
}) => {
  const smallerThanOriginal = (w) => !originalWidth || w <= originalWidth;
  if (layout === "full-width") {
    return breakpoints.filter(smallerThanOriginal);
  }
  if (!width) {
    return [];
  }
  const doubleWidth = width * 2;
  const maxSize = originalWidth ? Math.min(doubleWidth, originalWidth) : doubleWidth;
  if (layout === "fixed") {
    return originalWidth && width > originalWidth ? [originalWidth] : [width, maxSize];
  }
  if (layout === "constrained") {
    return [
      // Always include the image at 1x and 2x the specified width
      width,
      doubleWidth,
      ...breakpoints
    ].filter((w) => w <= maxSize).sort((a, b) => a - b);
  }
  return [];
};
const getSizesAttribute = ({
  width,
  layout
}) => {
  if (!width || !layout) {
    return void 0;
  }
  switch (layout) {
    // If screen is wider than the max size then image width is the max size,
    // otherwise it's the width of the screen
    case "constrained":
      return `(min-width: ${width}px) ${width}px, 100vw`;
    // Image is always the same width, whatever the size of the screen
    case "fixed":
      return `${width}px`;
    // Image is always the width of the screen
    case "full-width":
      return `100vw`;
    case "none":
    default:
      return void 0;
  }
};

function isLocalService(service) {
  if (!service) {
    return false;
  }
  return "transform" in service;
}
function parseQuality(quality) {
  let result = Number.parseInt(quality);
  if (Number.isNaN(result)) {
    return quality;
  }
  return result;
}
const sortNumeric = (a, b) => a - b;
function verifyOptions(options) {
  if (!options.src || !isRemoteImage(options.src) && !isESMImportedImage(options.src)) {
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(
        JSON.stringify(options.src),
        typeof options.src,
        JSON.stringify(options, (_, v) => v === void 0 ? null : v)
      )
    });
  }
  if (!isESMImportedImage(options.src)) {
    if (options.src.startsWith("/@fs/") || !isRemotePath(options.src) && !options.src.startsWith("/")) {
      throw new AstroError({
        ...LocalImageUsedWrongly,
        message: LocalImageUsedWrongly.message(options.src)
      });
    }
    let missingDimension;
    if (!options.width && !options.height) {
      missingDimension = "both";
    } else if (!options.width && options.height) {
      missingDimension = "width";
    } else if (options.width && !options.height) {
      missingDimension = "height";
    }
    if (missingDimension) {
      throw new AstroError({
        ...MissingImageDimension,
        message: MissingImageDimension.message(missingDimension, options.src)
      });
    }
  } else {
    if (!VALID_SUPPORTED_FORMATS.includes(options.src.format)) {
      throw new AstroError({
        ...UnsupportedImageFormat,
        message: UnsupportedImageFormat.message(
          options.src.format,
          options.src.src,
          VALID_SUPPORTED_FORMATS
        )
      });
    }
    if (options.widths && options.densities) {
      throw new AstroError(IncompatibleDescriptorOptions);
    }
    if (options.src.format !== "svg" && options.format === "svg") {
      throw new AstroError(UnsupportedImageConversion);
    }
  }
}
const baseService = {
  validateOptions(options) {
    verifyOptions(options);
    if (!options.format) {
      if (isESMImportedImage(options.src) && options.src.format === "svg") {
        options.format = "svg";
      } else {
        options.format = DEFAULT_OUTPUT_FORMAT;
      }
    }
    if (options.width) options.width = Math.round(options.width);
    if (options.height) options.height = Math.round(options.height);
    if (options.layout) {
      delete options.layout;
    }
    if (options.fit === "none") {
      delete options.fit;
    }
    return options;
  },
  getHTMLAttributes(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const {
      src,
      width,
      height,
      format,
      quality,
      densities,
      widths,
      formats,
      layout,
      priority,
      fit,
      position,
      background,
      ...attributes
    } = options;
    return {
      ...attributes,
      width: targetWidth,
      height: targetHeight,
      loading: attributes.loading ?? "lazy",
      decoding: attributes.decoding ?? "async"
    };
  },
  getSrcSet(options) {
    const { targetWidth, targetHeight } = getTargetDimensions(options);
    const aspectRatio = targetWidth / targetHeight;
    const { widths, densities } = options;
    const targetFormat = options.format ?? DEFAULT_OUTPUT_FORMAT;
    let transformedWidths = (widths ?? []).sort(sortNumeric);
    let imageWidth = options.width;
    let maxWidth = Number.POSITIVE_INFINITY;
    if (isESMImportedImage(options.src)) {
      imageWidth = options.src.width;
      maxWidth = imageWidth;
      if (transformedWidths.length > 0 && transformedWidths.at(-1) > maxWidth) {
        transformedWidths = transformedWidths.filter((width) => width <= maxWidth);
        transformedWidths.push(maxWidth);
      }
    }
    transformedWidths = Array.from(new Set(transformedWidths));
    const {
      width: transformWidth,
      height: transformHeight,
      ...transformWithoutDimensions
    } = options;
    let allWidths = [];
    if (densities) {
      const densityValues = densities.map((density) => {
        if (typeof density === "number") {
          return density;
        } else {
          return Number.parseFloat(density);
        }
      });
      const densityWidths = densityValues.sort(sortNumeric).map((density) => Math.round(targetWidth * density));
      allWidths = densityWidths.map((width, index) => ({
        width,
        descriptor: `${densityValues[index]}x`
      }));
    } else if (transformedWidths.length > 0) {
      allWidths = transformedWidths.map((width) => ({
        width,
        descriptor: `${width}w`
      }));
    }
    return allWidths.map(({ width, descriptor }) => {
      const height = Math.round(width / aspectRatio);
      const transform = { ...transformWithoutDimensions, width, height };
      return {
        transform,
        descriptor,
        attributes: {
          type: `image/${targetFormat}`
        }
      };
    });
  },
  getURL(options, imageConfig) {
    const searchParams = new URLSearchParams();
    if (isESMImportedImage(options.src)) {
      searchParams.append("href", options.src.src);
    } else if (isRemoteAllowed(options.src, imageConfig)) {
      searchParams.append("href", options.src);
    } else {
      return options.src;
    }
    const params = {
      w: "width",
      h: "height",
      q: "quality",
      f: "format",
      fit: "fit",
      position: "position",
      background: "background"
    };
    Object.entries(params).forEach(([param, key]) => {
      options[key] && searchParams.append(param, options[key].toString());
    });
    const imageEndpoint = joinPaths("/", imageConfig.endpoint.route);
    let url = `${imageEndpoint}?${searchParams}`;
    if (imageConfig.assetQueryParams) {
      const assetQueryString = imageConfig.assetQueryParams.toString();
      if (assetQueryString) {
        url += "&" + assetQueryString;
      }
    }
    return url;
  },
  parseURL(url) {
    const params = url.searchParams;
    if (!params.has("href")) {
      return void 0;
    }
    const transform = {
      src: params.get("href"),
      width: params.has("w") ? Number.parseInt(params.get("w")) : void 0,
      height: params.has("h") ? Number.parseInt(params.get("h")) : void 0,
      format: params.get("f"),
      quality: params.get("q"),
      fit: params.get("fit"),
      position: params.get("position") ?? void 0,
      background: params.get("background") ?? void 0
    };
    return transform;
  },
  getRemoteSize(url, imageConfig) {
    return inferRemoteSize(url, imageConfig);
  }
};
function getTargetDimensions(options) {
  let targetWidth = options.width;
  let targetHeight = options.height;
  if (isESMImportedImage(options.src)) {
    const aspectRatio = options.src.width / options.src.height;
    if (targetHeight && !targetWidth) {
      targetWidth = Math.round(targetHeight * aspectRatio);
    } else if (targetWidth && !targetHeight) {
      targetHeight = Math.round(targetWidth / aspectRatio);
    } else if (!targetWidth && !targetHeight) {
      targetWidth = options.src.width;
      targetHeight = options.src.height;
    }
  }
  return {
    targetWidth,
    targetHeight
  };
}

function isImageMetadata(src) {
  return src.fsPath && !("fsPath" in src);
}

const PLACEHOLDER_BASE = "astro://placeholder";
function createPlaceholderURL(pathOrUrl) {
  return new URL(pathOrUrl, PLACEHOLDER_BASE);
}
function stringifyPlaceholderURL(url) {
  return url.href.replace(PLACEHOLDER_BASE, "");
}

const cssFitValues = ["fill", "contain", "cover", "scale-down"];
async function getConfiguredImageService() {
  if (!globalThis?.astroAsset?.imageService) {
    const { default: service } = await import(
      // @ts-expect-error
      './sharp_-EHURDvq.mjs'
    ).catch((e) => {
      const error = new AstroError(InvalidImageService);
      error.cause = e;
      throw error;
    });
    if (!globalThis.astroAsset) globalThis.astroAsset = {};
    globalThis.astroAsset.imageService = service;
    return service;
  }
  return globalThis.astroAsset.imageService;
}
async function getImage$1(options, imageConfig) {
  if (!options || typeof options !== "object") {
    throw new AstroError({
      ...ExpectedImageOptions,
      message: ExpectedImageOptions.message(JSON.stringify(options))
    });
  }
  if (typeof options.src === "undefined") {
    throw new AstroError({
      ...ExpectedImage,
      message: ExpectedImage.message(
        options.src,
        "undefined",
        JSON.stringify(options)
      )
    });
  }
  if (isImageMetadata(options)) {
    throw new AstroError(ExpectedNotESMImage);
  }
  const service = await getConfiguredImageService();
  const resolvedOptions = {
    ...options,
    src: await resolveSrc(options.src)
  };
  let originalWidth;
  let originalHeight;
  if (resolvedOptions.inferSize) {
    delete resolvedOptions.inferSize;
    if (isRemoteImage(resolvedOptions.src) && isRemotePath(resolvedOptions.src)) {
      if (!isRemoteAllowed(resolvedOptions.src, imageConfig)) {
        throw new AstroError({
          ...RemoteImageNotAllowed,
          message: RemoteImageNotAllowed.message(resolvedOptions.src)
        });
      }
      const getRemoteSize = (url) => service.getRemoteSize?.(url, imageConfig) ?? inferRemoteSize(url, imageConfig);
      const result = await getRemoteSize(resolvedOptions.src);
      resolvedOptions.width ??= result.width;
      resolvedOptions.height ??= result.height;
      originalWidth = result.width;
      originalHeight = result.height;
    }
  }
  const originalFilePath = isESMImportedImage(resolvedOptions.src) ? resolvedOptions.src.fsPath : void 0;
  const clonedSrc = isESMImportedImage(resolvedOptions.src) ? (
    // @ts-expect-error - clone is a private, hidden prop
    resolvedOptions.src.clone ?? resolvedOptions.src
  ) : resolvedOptions.src;
  if (isESMImportedImage(clonedSrc)) {
    originalWidth = clonedSrc.width;
    originalHeight = clonedSrc.height;
  }
  if (originalWidth && originalHeight) {
    const aspectRatio = originalWidth / originalHeight;
    if (resolvedOptions.height && !resolvedOptions.width) {
      resolvedOptions.width = Math.round(resolvedOptions.height * aspectRatio);
    } else if (resolvedOptions.width && !resolvedOptions.height) {
      resolvedOptions.height = Math.round(resolvedOptions.width / aspectRatio);
    } else if (!resolvedOptions.width && !resolvedOptions.height) {
      resolvedOptions.width = originalWidth;
      resolvedOptions.height = originalHeight;
    }
  }
  resolvedOptions.src = clonedSrc;
  const layout = options.layout ?? imageConfig.layout ?? "none";
  if (resolvedOptions.priority) {
    resolvedOptions.loading ??= "eager";
    resolvedOptions.decoding ??= "sync";
    resolvedOptions.fetchpriority ??= "high";
    delete resolvedOptions.priority;
  } else {
    resolvedOptions.loading ??= "lazy";
    resolvedOptions.decoding ??= "async";
    resolvedOptions.fetchpriority ??= void 0;
  }
  if (layout !== "none") {
    resolvedOptions.widths ||= getWidths({
      width: resolvedOptions.width,
      layout,
      originalWidth,
      breakpoints: imageConfig.breakpoints?.length ? imageConfig.breakpoints : isLocalService(service) ? LIMITED_RESOLUTIONS : DEFAULT_RESOLUTIONS
    });
    resolvedOptions.sizes ||= getSizesAttribute({ width: resolvedOptions.width, layout });
    delete resolvedOptions.densities;
    resolvedOptions["data-astro-image"] = layout;
    if (resolvedOptions.fit && cssFitValues.includes(resolvedOptions.fit)) {
      resolvedOptions["data-astro-image-fit"] = resolvedOptions.fit;
    }
    if (resolvedOptions.position) {
      resolvedOptions["data-astro-image-pos"] = resolvedOptions.position.replace(/\s+/g, "-");
    }
  }
  const validatedOptions = service.validateOptions ? await service.validateOptions(resolvedOptions, imageConfig) : resolvedOptions;
  const srcSetTransforms = service.getSrcSet ? await service.getSrcSet(validatedOptions, imageConfig) : [];
  const lazyImageURLFactory = (getValue) => {
    let cached = null;
    return () => cached ??= getValue();
  };
  const initialImageURL = await service.getURL(validatedOptions, imageConfig);
  let lazyImageURL = lazyImageURLFactory(() => initialImageURL);
  const matchesValidatedTransform = (transform) => transform.width === validatedOptions.width && transform.height === validatedOptions.height && transform.format === validatedOptions.format;
  let srcSets = await Promise.all(
    srcSetTransforms.map(async (srcSet) => {
      return {
        transform: srcSet.transform,
        url: matchesValidatedTransform(srcSet.transform) ? initialImageURL : await service.getURL(srcSet.transform, imageConfig),
        descriptor: srcSet.descriptor,
        attributes: srcSet.attributes
      };
    })
  );
  if (isLocalService(service) && globalThis.astroAsset.addStaticImage && !(isRemoteImage(validatedOptions.src) && initialImageURL === validatedOptions.src)) {
    const propsToHash = service.propertiesToHash ?? DEFAULT_HASH_PROPS;
    lazyImageURL = lazyImageURLFactory(
      () => globalThis.astroAsset.addStaticImage(validatedOptions, propsToHash, originalFilePath)
    );
    srcSets = srcSetTransforms.map((srcSet) => {
      return {
        transform: srcSet.transform,
        url: matchesValidatedTransform(srcSet.transform) ? lazyImageURL() : globalThis.astroAsset.addStaticImage(srcSet.transform, propsToHash, originalFilePath),
        descriptor: srcSet.descriptor,
        attributes: srcSet.attributes
      };
    });
  } else if (imageConfig.assetQueryParams) {
    const imageURLObj = createPlaceholderURL(initialImageURL);
    imageConfig.assetQueryParams.forEach((value, key) => {
      imageURLObj.searchParams.set(key, value);
    });
    lazyImageURL = lazyImageURLFactory(() => stringifyPlaceholderURL(imageURLObj));
    srcSets = srcSets.map((srcSet) => {
      const urlObj = createPlaceholderURL(srcSet.url);
      imageConfig.assetQueryParams.forEach((value, key) => {
        urlObj.searchParams.set(key, value);
      });
      return {
        ...srcSet,
        url: stringifyPlaceholderURL(urlObj)
      };
    });
  }
  return {
    rawOptions: resolvedOptions,
    options: validatedOptions,
    get src() {
      return lazyImageURL();
    },
    srcSet: {
      values: srcSets,
      attribute: srcSets.map((srcSet) => `${srcSet.url} ${srcSet.descriptor}`).join(", ")
    },
    attributes: service.getHTMLAttributes !== void 0 ? await service.getHTMLAttributes(validatedOptions, imageConfig) : {}
  };
}

Function.prototype.toString.call(Object);

const $$Image = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Image;
  const props = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  if (typeof props.width === "string") {
    props.width = Number.parseInt(props.width);
  }
  if (typeof props.height === "string") {
    props.height = Number.parseInt(props.height);
  }
  const layout = props.layout ?? imageConfig.layout ?? "none";
  if (layout !== "none") {
    props.layout ??= imageConfig.layout;
    props.fit ??= imageConfig.objectFit ?? "cover";
    props.position ??= imageConfig.objectPosition ?? "center";
  } else if (imageConfig.objectFit || imageConfig.objectPosition) {
    props.fit ??= imageConfig.objectFit;
    props.position ??= imageConfig.objectPosition;
  }
  const image = await getImage(props);
  const additionalAttributes = {};
  if (image.srcSet.values.length > 0) {
    additionalAttributes.srcset = image.srcSet.attribute;
  }
  const { class: className, ...attributes } = { ...additionalAttributes, ...image.attributes };
  return renderTemplate`${maybeRenderHead()}<img${addAttribute(image.src, "src")}${spreadAttributes(attributes)}${addAttribute(className, "class")}>`;
}, "C:/Users/adaredu/Documents/densora/adardev/node_modules/astro/components/Image.astro", void 0);

const $$Picture = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Picture;
  const defaultFormats = ["webp"];
  const defaultFallbackFormat = "png";
  const specialFormatsFallback = ["gif", "svg", "jpg", "jpeg"];
  const { formats = defaultFormats, pictureAttributes = {}, fallbackFormat, ...props } = Astro2.props;
  if (props.alt === void 0 || props.alt === null) {
    throw new AstroError(ImageMissingAlt);
  }
  const scopedStyleClass = props.class?.match(/\bastro-\w{8}\b/)?.[0];
  if (scopedStyleClass) {
    if (pictureAttributes.class) {
      pictureAttributes.class = `${pictureAttributes.class} ${scopedStyleClass}`;
    } else {
      pictureAttributes.class = scopedStyleClass;
    }
  }
  const layout = props.layout ?? imageConfig.layout ?? "none";
  const useResponsive = layout !== "none";
  if (useResponsive) {
    props.layout ??= imageConfig.layout;
    props.fit ??= imageConfig.objectFit ?? "cover";
    props.position ??= imageConfig.objectPosition ?? "center";
  } else if (imageConfig.objectFit || imageConfig.objectPosition) {
    props.fit ??= imageConfig.objectFit;
    props.position ??= imageConfig.objectPosition;
  }
  for (const key in props) {
    if (key.startsWith("data-astro-cid")) {
      pictureAttributes[key] = props[key];
    }
  }
  const originalSrc = await resolveSrc(props.src);
  const optimizedImages = await Promise.all(
    formats.map(
      async (format) => await getImage({
        ...props,
        src: originalSrc,
        format,
        widths: props.widths,
        densities: props.densities
      })
    )
  );
  const clonedSrc = isESMImportedImage(originalSrc) ? (
    // @ts-expect-error - clone is a private, hidden prop
    originalSrc.clone ?? originalSrc
  ) : originalSrc;
  let resultFallbackFormat = fallbackFormat ?? defaultFallbackFormat;
  if (!fallbackFormat && isESMImportedImage(clonedSrc) && specialFormatsFallback.includes(clonedSrc.format)) {
    resultFallbackFormat = clonedSrc.format;
  }
  const fallbackImage = await getImage({
    ...props,
    format: resultFallbackFormat,
    widths: props.widths,
    densities: props.densities
  });
  const imgAdditionalAttributes = {};
  const sourceAdditionalAttributes = {};
  if (props.sizes) {
    sourceAdditionalAttributes.sizes = props.sizes;
  }
  if (fallbackImage.srcSet.values.length > 0) {
    imgAdditionalAttributes.srcset = fallbackImage.srcSet.attribute;
  }
  const { class: className, ...attributes } = {
    ...imgAdditionalAttributes,
    ...fallbackImage.attributes
  };
  return renderTemplate`${maybeRenderHead()}<picture${spreadAttributes(pictureAttributes)}> ${Object.entries(optimizedImages).map(([_, image]) => {
    const srcsetAttribute = props.densities || !props.densities && !props.widths && !useResponsive ? `${image.src}${image.srcSet.values.length > 0 ? ", " + image.srcSet.attribute : ""}` : image.srcSet.attribute;
    return renderTemplate`<source${addAttribute(srcsetAttribute, "srcset")}${addAttribute(mime.lookup(image.options.format ?? image.src) ?? `image/${image.options.format}`, "type")}${spreadAttributes(sourceAdditionalAttributes)}>`;
  })}  <img${addAttribute(fallbackImage.src, "src")}${spreadAttributes(attributes)}${addAttribute(className, "class")}> </picture>`;
}, "C:/Users/adaredu/Documents/densora/adardev/node_modules/astro/components/Picture.astro", void 0);

const componentDataByCssVariable = new Map([]);

function filterPreloads(data, preload) {
  if (!preload) {
    return null;
  }
  if (preload === true) {
    return data;
  }
  return data.filter(
    ({ weight, style, subset }) => preload.some((p) => {
      if (p.weight !== void 0 && weight !== void 0 && !checkWeight(p.weight.toString(), weight)) {
        return false;
      }
      if (p.style !== void 0 && p.style !== style) {
        return false;
      }
      if (p.subset !== void 0 && p.subset !== subset) {
        return false;
      }
      return true;
    })
  );
}
function checkWeight(input, target) {
  const trimmedInput = input.trim();
  if (trimmedInput.includes(" ")) {
    return trimmedInput === target;
  }
  if (target.includes(" ")) {
    const [a, b] = target.split(" ");
    const parsedInput = Number.parseInt(input);
    return parsedInput >= Number.parseInt(a) && parsedInput <= Number.parseInt(b);
  }
  return input === target;
}

const $$Font = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Font;
  const { cssVariable, preload = false } = Astro2.props;
  const data = componentDataByCssVariable.get(cssVariable);
  if (!data) {
    throw new AstroError({
      ...FontFamilyNotFound,
      message: FontFamilyNotFound.message(cssVariable)
    });
  }
  const filteredPreloadData = filterPreloads(data.preloads, preload);
  return renderTemplate`<style>${unescapeHTML(data.css)}</style>${filteredPreloadData?.map(({ url, type }) => renderTemplate`<link rel="preload"${addAttribute(url, "href")} as="font"${addAttribute(`font/${type}`, "type")} crossorigin>`)}`;
}, "C:/Users/adaredu/Documents/densora/adardev/node_modules/astro/components/Font.astro", void 0);

const assetQueryParams = undefined;
					const imageConfig = {"endpoint":{"route":"/_image"},"service":{"entrypoint":"astro/assets/services/sharp","config":{}},"domains":[],"remotePatterns":[],"responsiveStyles":false};
					Object.defineProperty(imageConfig, 'assetQueryParams', {
						value: assetQueryParams,
						enumerable: false,
						configurable: true,
					});
							const getImage = async (options) => await getImage$1(options, imageConfig);

function createSvgComponent({ meta, attributes, children, styles }) {
  const hasStyles = styles.length > 0;
  const Component = createComponent({
    async factory(result, props) {
      const normalizedProps = normalizeProps(attributes, props);
      if (hasStyles && result.cspDestination) {
        for (const style of styles) {
          const hash = await generateCspDigest(style, result.cspAlgorithm);
          result._metadata.extraStyleHashes.push(hash);
        }
      }
      return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
    },
    propagation: hasStyles ? "self" : "none"
  });
  Object.defineProperty(Component, "toJSON", {
    value: () => meta,
    enumerable: false
  });
  return Object.assign(Component, meta);
}
const ATTRS_TO_DROP = ["xmlns", "xmlns:xlink", "version"];
const DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
  for (const attr of ATTRS_TO_DROP) {
    delete attributes[attr];
  }
  return attributes;
}
function normalizeProps(attributes, props) {
  return dropAttributes({ ...DEFAULT_ATTRS, ...attributes, ...props });
}

const Adardev_logo = createSvgComponent({"meta":{"src":"/_astro/adardev_logo.DP8jomiU.svg","width":216,"height":212,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 215.71 212.42"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #18cda9;\r\n      }\r\n\r\n      .cls-2 {\r\n        stroke-width: 3px;\r\n      }\r\n\r\n      .cls-2, .cls-3, .cls-4 {\r\n        fill: none;\r\n        stroke: #18cda9;\r\n        stroke-miterlimit: 10;\r\n      }\r\n\r\n      .cls-3 {\r\n        stroke-width: 10px;\r\n      }\r\n\r\n      .cls-4 {\r\n        stroke-width: 9px;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <g id=\"Layer_1-2\" data-name=\"Layer 1-2\">\r\n    <path class=\"cls-4\" d=\"M141.34,185.24l-106.09-.58c-1.6,0-2.89-1.32-2.88-2.92,0-.54.16-1.07.44-1.52l26.85-42.88c.53-.85,1.47-1.37,2.47-1.36l53.63.29c1.85,0,3.57.93,4.61,2.46l25.66,37.72c1.76,2.55,1.11,6.05-1.44,7.8-.95.66-2.09,1-3.25.99h0Z\" />\r\n    <path class=\"cls-2\" d=\"M76.69,136.54c-.83.85-1.61,1.74-2.35,2.67-.01.77-.2,1.53-.54,2.22-3.19,6.52-7.74,12.16-11.33,18.45-2.08,3.66-3.76,7.74-5.8,11.55l41.88-34.8-21.86-.09Z\" />\r\n    <path class=\"cls-3\" d=\"M207.47,153.68l-65.37-119.13c-.18.88-.6,1.69-1.2,2.35-1.8,3.59-3.59,7.19-5.46,10.75-6.23,11.93-13.09,24.5-22,34.78l63.23,115.11c2.88,5.19,9.62,6.38,12.9,2.3l16.78-21c5.38-6.72,5.82-16.66,1.12-25.16h0Z\" />\r\n    <path class=\"cls-3\" d=\"M143.63,31.49L33.77,205.2c-1.55,2.46-4.79,3-6.21,1l-19-26.58c-5-7.05-4.73-17.39.78-26.1L95.67,17.05c8.54-13.5,26.36-16.24,34.1-5.24l13.86,19.68Z\" />\r\n    <path class=\"cls-2\" d=\"M136.85,42.61l-23.75,38.81,8.7,16.19,16.6-54.59c-.54-.05-1.06-.19-1.55-.41Z\" />\r\n    <path class=\"cls-1\" d=\"M119.88,85.63c.84-7.58,2.73-15.01,5.59-22.08.22-.79-.22-1.6-1-1.85-.78-.2-1.59.23-1.84,1-2.94,7.33-4.86,15.03-5.7,22.88-.21,1.92,2.8,1.9,3,0l-.05.05Z\" />\r\n    <path class=\"cls-1\" d=\"M115.62,82.83c2,2.41,3.28,5.33,3.69,8.43,0,.83.69,1.49,1.52,1.48.66,0,1.24-.45,1.42-1.08l9.71-32.25c.57-1.88-2.23-2.58-2.89-.8l-9.45,25.6,2.89.8,1.4-7.87c.18-.81-.34-1.61-1.14-1.79-.75-.16-1.5.27-1.75,1l-2.61,6.89c-.68,1.81,2.2,2.57,2.9.79l5.9-15.07c.55-1.38-1.57-2.58-2.5-1.46-2.63,3.09-3.68,7.23-2.83,11.2.25.8,1.1,1.25,1.9,1,.35-.11.65-.34.84-.64l8.44-12.72c1.07-1.61-1.53-3.11-2.59-1.51l-8.44,12.69,2.75.36c-.61-2.93.14-5.98,2.05-8.29l-2.49-1.42-5.91,15.07,2.9.79,2.6-6.89-2.91-.8-1.4,7.86c-.2.8.3,1.62,1.1,1.81.77.19,1.56-.26,1.79-1.01l9.45-25.6-2.89-.8-9.73,32.26,2.95.4c-.47-3.88-2.06-7.55-4.56-10.56-1.24-1.48-3.35.65-2.13,2.13h.02Z\" />\r\n    <path class=\"cls-1\" d=\"M64.47,165.34l15.24-19.86c.4-.72.17-1.63-.54-2.05-.71-.37-1.58-.13-2,.54l-15.29,19.9c-.41.72-.17,1.63.54,2.05.71.37,1.58.13,2-.54l.05-.04Z\" />\r\n    <path class=\"cls-1\" d=\"M68.85,158.09l8.59-13.7c1-1.64-1.57-3.15-2.59-1.52l-8.59,13.71c-1,1.64,1.57,3.15,2.59,1.51Z\" />\r\n    <path class=\"cls-1\" d=\"M70.99,159.92l23.22-19.49c1-.87.15-2.54-1.06-2.56l-7-.1c-2.36,0-4.75-.19-7.1-.08-2.12.1-3.32,1.24-4.34,3-1.05,1.84-1.82,3.84-2.26,5.91-.24,1.14,1.07,2.54,2.21,1.69,1.01-.76,1.79-1.78,2.26-2.95.46-1,.83-2.36,2-2.8,1.63-.43,3.32-.62,5-.55,1.9-.08,3.81-.07,5.72,0l-.4-2.94-7.72,1.15c-2.26.34-4.5.6-6.08,2.45-1.38,1.82-2.53,3.81-3.42,5.91-1.1,2.25-2.1,4.55-3,6.88-.2.82.3,1.64,1.12,1.84.37.09.76.04,1.09-.15,2.97-2.04,5.81-4.26,8.52-6.64,1.33-1.2,2.67-2.44,4-3.72.59-.59,1.17-1.19,1.74-1.79s1.21-1.6,1.95-1.45l.39-2.95-11.06.53v3l4.85-.54-1.07-2.56-7.61,7.8c-.56.61-.52,1.57.09,2.13.47.43,1.15.52,1.72.23,3.52-1.97,6.77-4.38,9.67-7.18,1.39-1.34-.73-3.46-2.12-2.12-2.72,2.61-5.77,4.87-9.06,6.71l1.82,2.35,7.62-7.8c.82-.85.29-2.71-1.06-2.56l-4.85.54c-1.87.2-2,3.09,0,3l11.06-.53c1.61-.07,2.14-2.59.4-2.94-2.13-.44-3.49.76-4.86,2.21s-2.72,2.79-4.15,4.12c-2.97,2.75-6.13,5.28-9.46,7.57l2.21,1.69c.79-2,1.67-4,2.62-6,.79-1.94,1.8-3.79,3-5.51,1.27-1.54,3.6-1.5,5.43-1.77l7-1.05c1.74-.26,1.2-2.87-.4-2.95-2.06-.09-4.11-.09-6.16,0-1.79-.02-3.57.19-5.31.63-1.35.46-2.46,1.43-3.1,2.71-.55,1-.84,2.61-1.82,3.34l2.16,1.71c.36-1.75.98-3.44,1.85-5,.31-.55.65-1.33,1.26-1.61.93-.19,1.88-.21,2.82-.06l11.83.16-1.06-2.49-23.23,19.46c-1.48,1.24.65,3.35,2.13,2.12h0Z\" />\r\n  </g>\r\n","styles":[]});

const $$NavBar = createComponent(($$result, $$props, $$slots) => {
  const navLinks = [
    { name: "Inicio", href: "/", icon: "home" },
    { name: "Sobre Mi", href: "#about", icon: "user" },
    { name: "Experiencia", href: "#experience", icon: "briefcase" },
    { name: "Proyectos", href: "#projects", icon: "code" },
    { name: "Habilidades", href: "#skills", icon: "cpu" }
  ];
  return renderTemplate`<!-- Navbar Left: Logo & Brand -->${maybeRenderHead()}<div class="navbar-corner-container navbar-left glass-nav rounded-2xl" data-astro-cid-ymhdp2rl> <a href="/" class="nav-item !p-2 flex items-center gap-2 group cursor-pointer" aria-label="Inicio" data-astro-cid-ymhdp2rl> ${renderComponent($$result, "Image", $$Image, { "src": Adardev_logo, "alt": "adardev Logo", "class": "w-6 h-6 sm:w-8 sm:h-8 transition-transform group-hover:scale-110", "data-astro-cid-ymhdp2rl": true })} <span class="mobile-logo-text font-bold text-lg hidden sm:block tracking-tight text-body" data-astro-cid-ymhdp2rl>adardev</span> </a> </div> <!-- Navbar Center: Navigation Links --> <header class="fixed top-0 left-0 w-full z-[90] pointer-events-none flex justify-center p-3 sm:p-4" data-astro-cid-ymhdp2rl> <nav id="navbar-container" class="glass-nav rounded-2xl flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 pointer-events-auto transition-all duration-300" data-astro-cid-ymhdp2rl> ${navLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class="nav-item group relative cursor-pointer"${addAttribute(link.name, "aria-label")} data-astro-cid-ymhdp2rl> <span class="sr-only" data-astro-cid-ymhdp2rl>${link.name}</span>  ${link.icon === "home" && renderTemplate`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6" data-astro-cid-ymhdp2rl> <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" data-astro-cid-ymhdp2rl></path> <polyline points="9 22 9 12 15 12 15 22" data-astro-cid-ymhdp2rl></polyline> </svg>`} ${link.icon === "user" && renderTemplate`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6" data-astro-cid-ymhdp2rl> <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" data-astro-cid-ymhdp2rl></path> <circle cx="12" cy="7" r="4" data-astro-cid-ymhdp2rl></circle> </svg>`} ${link.icon === "briefcase" && renderTemplate`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6" data-astro-cid-ymhdp2rl> <rect width="20" height="14" x="2" y="7" rx="2" ry="2" data-astro-cid-ymhdp2rl></rect> <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" data-astro-cid-ymhdp2rl></path> </svg>`} ${link.icon === "code" && renderTemplate`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6" data-astro-cid-ymhdp2rl> <polyline points="16 18 22 12 16 6" data-astro-cid-ymhdp2rl></polyline> <polyline points="8 6 2 12 8 18" data-astro-cid-ymhdp2rl></polyline> </svg>`} ${link.icon === "cpu" && renderTemplate`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6" data-astro-cid-ymhdp2rl> <rect x="4" y="4" width="16" height="16" rx="2" data-astro-cid-ymhdp2rl></rect> <rect x="9" y="9" width="6" height="6" data-astro-cid-ymhdp2rl></rect> <path d="M9 1V4" data-astro-cid-ymhdp2rl></path> <path d="M15 1V4" data-astro-cid-ymhdp2rl></path> <path d="M9 20V23" data-astro-cid-ymhdp2rl></path> <path d="M15 20V23" data-astro-cid-ymhdp2rl></path> <path d="M20 9H23" data-astro-cid-ymhdp2rl></path> <path d="M20 14H23" data-astro-cid-ymhdp2rl></path> <path d="M1 9H4" data-astro-cid-ymhdp2rl></path> <path d="M1 14H4" data-astro-cid-ymhdp2rl></path> </svg>`}  <span class="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-bg-card text-body text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block" data-astro-cid-ymhdp2rl>${link.name}</span> </a>`)} </nav> </header> <!-- Navbar Right: Actions (Theme, etc) --> <div class="navbar-corner-container navbar-right glass-nav rounded-2xl" data-astro-cid-ymhdp2rl> <button id="theme-toggle" class="nav-item cursor-pointer" aria-label="Cambiar tema" data-astro-cid-ymhdp2rl> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6 sun-icon hidden dark:block" data-astro-cid-ymhdp2rl><circle cx="12" cy="12" r="4" data-astro-cid-ymhdp2rl></circle><path d="M12 2v2" data-astro-cid-ymhdp2rl></path><path d="M12 20v2" data-astro-cid-ymhdp2rl></path><path d="m4.93 4.93 1.41 1.41" data-astro-cid-ymhdp2rl></path><path d="m17.66 17.66 1.41 1.41" data-astro-cid-ymhdp2rl></path><path d="M2 12h2" data-astro-cid-ymhdp2rl></path><path d="M20 12h2" data-astro-cid-ymhdp2rl></path><path d="m6.34 17.66-1.41 1.41" data-astro-cid-ymhdp2rl></path><path d="m19.07 4.93-1.41 1.41" data-astro-cid-ymhdp2rl></path></svg> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6 moon-icon block dark:hidden" data-astro-cid-ymhdp2rl><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" data-astro-cid-ymhdp2rl></path></svg> </button> </div> ${renderScript($$result, "C:/Users/adaredu/Documents/densora/adardev/src/components/NavBar.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/components/NavBar.astro", void 0);

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title, description } = Astro2.props;
  return renderTemplate`<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><link rel="icon" href="/logos/adardev_logo.svg"><meta name="generator"${addAttribute(Astro2.generator, "content")}><title>${title || "adardev | Portfolio"}</title><meta name="description"${addAttribute(description || "Portfolio de adardev - Desarrollador Web y Movil", "content")}>${renderComponent($$result, "ClientRouter", $$ClientRouter, {})}${renderHead()}</head> <body class="bg-bg-dark text-body font-sans selection:bg-accent/30 selection:text-accent overflow-x-hidden antialiased"> ${renderComponent($$result, "NavBar", $$NavBar, {})} <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"> ${renderSlot($$result, $$slots["default"])} </main> ${renderScript($$result, "C:/Users/adaredu/Documents/densora/adardev/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/layouts/Layout.astro", void 0);

const $$Section = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Section;
  const { id, extraClass = "", padding = "true" } = Astro2.props;
  const paddingClass = padding === "false" ? "p-0" : "px-1 py-4 sm:p-6 md:p-8";
  return renderTemplate`${maybeRenderHead()}<section${addAttribute(id, "id")}${addAttribute(`flex flex-col ${paddingClass} ${extraClass}`, "class")}> ${renderSlot($$result, $$slots["default"])} </section>`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/components/section.astro", void 0);

const $$ButtonToolTip = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ButtonToolTip;
  const { iconSrc: Icon, label, link } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<a${addAttribute(link, "href")} class="relative group inline-block cursor-pointer"${addAttribute(label, "aria-label")} target="_blank" rel="noopener noreferrer"> <div class="w-12 h-12 glass-button rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary group-hover:bg-accent/10"> ${renderComponent($$result, "Icon", Icon, { "class": "w-6 h-6 transition-all duration-300 text-body fill-current group-hover:text-accent" })} </div> <!-- Tooltip --> <div class="absolute left-1/2 -translate-x-1/2 top-full mt-3 px-3 py-1.5 min-w-max text-xs sm:text-sm font-medium bg-bg-card text-body rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20 border border-accent/20 pointer-events-none"> ${label} <!-- Arrow --> <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-card border-t border-l border-accent/20 transform rotate-45"></div> </div> </a>`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/components/buttonToolTip.astro", void 0);

const $$Text = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Text;
  const { text, mt, mb, type, extraClass = "" } = Astro2.props;
  let marginTop = "";
  let marginBottom = "";
  let textSize = "";
  let textWeight = "";
  let color = "";
  if (mt == "true") marginTop = "mt-4 sm:mt-6";
  if (mb == "true") marginBottom = "mb-4 sm:mb-6";
  if (type == "text") {
    textSize = "text-base sm:text-lg";
    textWeight = "font-medium";
    color = "text-body";
  }
  if (type == "title") {
    textWeight = "font-semibold";
    textSize = "text-3xl sm:text-4xl md:text-5xl";
    color = "text-title";
  }
  if (type == "subTitle") {
    textWeight = "font-bold";
    textSize = "text-lg sm:text-xl md:text-2xl";
    color = "text-subtitle";
  }
  if (type == "mini") {
    textSize = "text-xs sm:text-sm";
    textWeight = "font-light";
    color = "text-subtitle";
  }
  return renderTemplate`${maybeRenderHead()}<p${addAttribute(`${textSize} ${marginTop} ${marginBottom} ${textWeight} ${color} ${extraClass}`, "class")}>${text}</p>`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/components/text.astro", void 0);

const Profile_Photo = new Proxy({"src":"/_astro/profile_photo.DXBSBJ2S.jpg","width":1000,"height":1000,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/adaredu/Documents/densora/adardev/src/assets/photos/profile_photo.jpg";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages?.add("C:/Users/adaredu/Documents/densora/adardev/src/assets/photos/profile_photo.jpg");
							return target[name];
						}
					});

const socialLinks = [
    { link: "https://github.com/adardev", iconSrc: "/icons/github_logo.svg", label: "/adardev" },
    { link: "https://www.linkedin.com/in/adardev", iconSrc: "/icons/linkedin_logo.svg", label: "/in/adardev" },
    { link: "https://www.youtube.com/@adardev1", iconSrc: "/icons/youtube_logo.svg", label: "/@adardev1" },
    { link: "https://maps.app.goo.gl/jgDoBZpe1rsiSNm7", iconSrc: "/icons/map_icon.svg", label: "Guadalajara, México" },
    { link: "tel:+523330362181", iconSrc: "/icons/phone_icon.svg", label: "33 3036 2181" },
];

const $$Hero = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Section", $$Section, { "extraClass": "mt-12 sm:mt-16 md:mt-24" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col sm:flex-row items-center gap-6 sm:gap-10"> <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-lg flex-shrink-0"> ${renderComponent($$result2, "Image", $$Image, { "src": Profile_Photo, "alt": "", "class": "object-cover w-full h-full" })} </div> <div class="flex flex-col items-center sm:items-start text-center sm:text-left gap-4"> <div> ${renderComponent($$result2, "Text", $$Text, { "type": "title", "text": "Hola, soy adardev", "i18nKey": "heroTitle" })} ${renderComponent($$result2, "Text", $$Text, { "type": "subTitle", "text": "Desarrollador de Software y Especialista en Sistemas", "i18nKey": "heroSubtitle" })} </div> <div class="flex flex-row items-center gap-2 sm:gap-5 justify-start w-fit"> <div class="flex flex-row gap-2 sm:gap-5"> ${socialLinks.map((social) => renderTemplate`${renderComponent($$result2, "ButtonToolTip", $$ButtonToolTip, { ...social })}`)} </div> <div class="shrink-0 w-[2px] h-8 bg-border-accent/30 self-center mx-1"></div> ${renderComponent($$result2, "ButtonToolTip", $$ButtonToolTip, { "iconSrc": "/icons/cv_icon.svg", "label": "Ver curriculum Vitae", "link": "/cvs/adardevCV.pdf", "i18nKey": "heroCV" })} </div> </div> </div> ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/sections/hero.astro", void 0);

const $$TitleSection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$TitleSection;
  const { imageSrc: Icon, title } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "Section", $$Section, { "extraClass": "flex flex-row gap-4 sm:gap-6 md:gap-10 mb-6 sm:mb-8 items-center", "padding": "false" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Section", $$Section, { "extraClass": "flex items-center justify-center", "padding": "false" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Icon", Icon, { "class": "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 text-title" })} ` })} ${renderComponent($$result2, "Section", $$Section, { "padding": "false" }, { "default": ($$result3) => renderTemplate` ${maybeRenderHead()}<p class="text-2xl sm:text-3xl md:text-4xl font-semibold text-title">${title}</p> ` })} ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/components/titleSection.astro", void 0);

const $$About = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Section", $$Section, { "id": "about", "extraClass": "my-12 sm:my-16 md:my-24" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TitleSection", $$TitleSection, { "imageSrc": "/icons/user_icon.svg", "title": "Sobre Mí", "i18nKey": "aboutTitle" })} ${renderComponent($$result2, "Text", $$Text, { "as": "p", "type": "text", "extraClass": "leading-relaxed sm:text-lg opacity-90", "i18nKey": "aboutText", "text": "Desarrollador enfocado en crear soluciones digitales eficientes y en la optimización de los sistemas que las soportan. Mi perfil combina la construcción de software con un conocimiento sólido en arquitectura de hardware y mantenimiento técnico, asegurando siempre el mejor rendimiento de los equipos y aplicaciones. Cuento con un nivel de inglés técnico intermedio, ideal para el análisis de documentación y la resolución de problemas." })} ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/sections/about.astro", void 0);

const $$Experience = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`import TitleSection from "../components/titleSection.astro"; import Section from "../components/section.astro"; import Portfolio_icon from "../assets/icons/portfolio_icon.svg"; import ${experiences} from "../data/portfolio.js"; import ExperienceItem from "../components/ExperienceItem.astro" ${renderComponent($$result, "Section", Section, { "id": "experience", "mt": "true", "mb": "true" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TitleSection", TitleSection, { "imageSrc": Portfolio_icon, "title": "Experiencia" })} ${renderComponent($$result2, "Section", Section, { "extraClass": "container mx-auto" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Section", Section, { "extraClass": "relative border-l-4 border-accent\r\nml-5" }, { "default": ($$result4) => renderTemplate`${experiences.map((exp) => renderTemplate`${renderComponent($$result4, "ExperienceItem", ExperienceItem, { ...exp })}`)}` })} ` })} ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/sections/experience.astro", void 0);

const Code_icon = createSvgComponent({"meta":{"src":"/_astro/code_icon.DBbBlPwh.svg","width":1029,"height":615,"format":"svg"},"attributes":{"id":"Layer_1","viewBox":"0 0 1028.9 615"},"children":"\r\n  <defs>\r\n    <style>\r\n      .st0 {\r\n        fill: #cbeeeb;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"st0\" d=\"M465.2,588.6c-6.6,20.2-28.4,31.1-48.5,24.4l-1.6-.5c-20.2-6.6-31.1-28.4-24.4-48.5L568.5,26.4c6.7-20.2,28.4-31.1,48.5-24.4l1.6.5c20.2,6.6,31.1,28.4,24.4,48.5l-177.8,537.6h0Z\" />\r\n  <path class=\"st0\" d=\"M97.3,293c-1.2,1.2-1.2,3.2,0,4.4,87.9,87.2,142.9,141.1,165.2,161.8,24.7,22.9,33.7,47.6,8,72.3-26.8,25.6-44.9,2.8-66.9-18.8C116,426.7,54.7,366.4,19.6,331.9c-31.9-31.5-21.4-51.1,6.5-78,46.8-45.1,101.3-98.2,163.7-159.3,17.4-17,30.1-29.2,38.3-36.7,1.9-1.7,4.1-2.7,6.6-2.9,15.1-1.5,25.6.3,31.6,5.6,23,20.4,23,42.2,0,65.5-22,22.2-78.3,77.8-169,166.9h0s0,0,0,0Z\" />\r\n  <path class=\"st0\" d=\"M924.6,303.7c3.5-3.5,3.5-9.1,0-12.6-54.8-55.2-106.4-106.4-154.8-153.6-4.1-3.9-12.3-13.1-24.7-27.4-7-8.2-8.8-17.3-5.2-27.2,10-27.7,44.2-38.1,66.2-16.4,103.9,102.4,175.3,173.1,214.3,212.4,9.7,9.8,11.1,23,3.9,39.7-.8,1.8-1.9,3.5-3.4,4.9-21.5,21.2-39.3,38.4-53.4,51.4-56,51.4-103.4,100.3-164,160.8-5.3,5.3-12,9-19.8,11.2-2.1.5-4.4.5-6.6-.3-12.4-4.6-22-6.3-30.7-16.4-16.1-18.7-13.5-38.4,7.7-59.2,62.8-61.6,119.6-117.2,170.4-167.1h0Z\" />\r\n","styles":[]});

const Web_icon = createSvgComponent({"meta":{"src":"/_astro/web_icon.CUe1Y191.svg","width":67,"height":67,"format":"svg"},"attributes":{"id":"Layer_1","viewBox":"0 0 66.8 66.8"},"children":"\r\n  <defs>\r\n    <style>\r\n      .st0 {\r\n        fill: #cbeeeb;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"st0\" d=\"M33.4,0C15,0,0,15,0,33.4s15,33.4,33.4,33.4,33.4-15,33.4-33.4S51.8,0,33.4,0ZM33.4,62.5c-2.9,0-6.6-5.9-8.5-16.2h16.9c-1.8,10.2-5.5,16.2-8.5,16.2h0ZM24.3,42.1c-.3-2.7-.5-5.6-.5-8.7s.2-6,.5-8.7h18.1c.3,2.7.5,5.6.5,8.7s-.2,6-.5,8.7c0,0-18.1,0-18.1,0ZM4.2,33.4c0-3,.5-6,1.3-8.7h14.5c-.3,2.8-.5,5.8-.5,8.7s.1,5.9.5,8.7H5.6c-.9-2.8-1.3-5.7-1.3-8.7ZM33.4,4.2c2.9,0,6.7,5.9,8.5,16.2h-16.9c1.8-10.2,5.5-16.2,8.5-16.2h0ZM46.7,24.6h14.5c.9,2.8,1.3,5.7,1.3,8.7s-.5,6-1.3,8.7h-14.5c.3-2.8.5-5.8.5-8.7s-.2-5.9-.5-8.7ZM59.5,20.4h-13.4c-.6-3.6-1.5-7-2.5-9.9-.8-2-1.6-3.8-2.6-5.3,8.1,2.2,14.8,7.8,18.4,15.2ZM25.7,5.3c-.9,1.5-1.8,3.2-2.6,5.3-1.1,2.9-1.9,6.2-2.5,9.9H7.3c3.7-7.4,10.4-12.9,18.4-15.1,0,0,0,0,0,0ZM7.3,46.4h13.4c.6,3.6,1.5,7,2.5,9.9.8,2,1.6,3.8,2.6,5.3-8.1-2.2-14.8-7.8-18.4-15.1ZM41,61.5c.9-1.5,1.8-3.2,2.6-5.3,1.1-2.9,1.9-6.2,2.5-9.9h13.3c-3.7,7.3-10.4,13-18.4,15.1Z\" />\r\n","styles":[]});

const Github_logo = createSvgComponent({"meta":{"src":"/_astro/github_logo.BkQttUh3.svg","width":2500,"height":2432,"format":"svg"},"attributes":{"id":"Layer_1","viewBox":"0 0 2500 2432"},"children":"\r\n  <defs>\r\n    <style>\r\n      .st0 {\r\n        fill: #198980;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"st0\" d=\"M1245.17,0C557.57,0,0,557.47,0,1245.17c0,550.16,356.78,1016.89,851.52,1181.54,62.23,11.52,85.08-27.01,85.08-59.9,0-29.69-1.16-127.78-1.69-231.83-346.42,75.32-419.51-146.91-419.51-146.91-56.64-143.93-138.25-182.19-138.25-182.19-112.97-77.29,8.52-75.7,8.52-75.7,125.04,8.79,190.88,128.32,190.88,128.32,111.05,190.36,291.29,135.32,362.34,103.52,11.17-80.49,43.45-135.41,79.05-166.5-276.56-31.49-567.3-138.26-567.3-615.37,0-135.94,48.64-247.02,128.3-334.22-12.93-31.37-55.55-158.01,12.06-329.52,0,0,104.56-33.47,342.51,127.64,99.32-27.6,205.84-41.43,311.66-41.89,105.82.47,212.42,14.3,311.93,41.89,237.67-161.1,342.08-127.64,342.08-127.64,67.77,171.51,25.14,298.15,12.21,329.52,79.83,87.2,128.14,198.27,128.14,334.22,0,478.24-291.29,583.55-568.55,614.38,44.66,38.64,84.45,114.42,84.45,230.59,0,166.6-1.45,300.69-1.45,341.71,0,33.13,22.41,71.96,85.54,59.74,494.47-164.83,850.8-631.41,850.8-1181.38C2490.32,557.47,1932.83,0,1245.17,0\" />\r\n","styles":[]});

const Php_logo = createSvgComponent({"meta":{"src":"/_astro/php_logo.B_JGyxKa.svg","width":2500,"height":1251,"format":"svg"},"attributes":{"id":"Layer_1","viewBox":"0 0 2500 1251"},"children":"\r\n  <defs>\r\n    <style>\r\n      .st0 {\r\n        fill: #fff;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"st0\" d=\"M197.03,263.15h369.24c108.37.91,186.91,32.16,235.6,93.69,48.69,61.53,64.75,145.57,48.22,252.13-6.42,48.69-20.67,96.44-42.71,143.29-21.42,47.27-51.31,90.23-88.18,126.75-45.93,47.75-95.06,78.06-147.42,90.93s-106.55,19.29-162.57,19.29h-165.33l-52.35,261.77H.01L197.03,263.15ZM358.23,420.21l-82.67,413.33c5.51.91,11.02,1.38,16.53,1.38h19.29c88.18.91,161.67-7.8,220.44-26.18,58.78-19.29,98.29-86.33,118.49-201.15,16.53-96.44,0-152.02-49.6-166.71-48.69-14.69-109.75-21.58-183.24-20.67-11.02.91-21.58,1.38-31.69,1.38h-28.93l1.38-1.38ZM1068.24,0h190.13l-53.73,263.15h170.84c93.69,1.85,163.48,21.13,209.42,57.87,46.84,36.73,60.62,106.55,41.33,209.42l-92.31,458.79h-192.89l88.18-438.13c9.18-45.93,6.42-78.53-8.27-97.82s-46.38-28.93-95.07-28.93l-152.93-1.38-112.98,566.26h-190.13L1068.24,0ZM1830.4,263.15h369.24c108.37.91,186.91,32.16,235.6,93.69s64.75,145.57,48.22,252.13c-6.42,48.69-20.67,96.44-42.71,143.29-21.42,47.27-51.31,90.23-88.18,126.75-45.93,47.75-95.06,78.06-147.42,90.93s-106.55,19.29-162.57,19.29h-165.33l-52.36,261.77h-191.51l197.02-987.85ZM1991.6,420.21l-82.67,413.33c5.51.91,11.02,1.38,16.53,1.38h19.29c88.18.91,161.67-7.8,220.44-26.18,58.78-19.29,98.29-86.33,118.49-201.15,16.53-96.44,0-152.02-49.6-166.71-48.69-14.69-109.75-21.58-183.24-20.67-11.02.91-21.58,1.38-31.69,1.38h-28.93l1.38-1.38Z\" />\r\n","styles":[]});

const Electron_logo = createSvgComponent({"meta":{"src":"/_astro/electron_logo.DiHNT7tb.svg","width":123,"height":123,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 122.88 122.88"},"children":"<defs><style>.cls-1{fill:#2b2e3a;fill-rule:evenodd;}.cls-2{fill:#9feaf9;}</style></defs><title>electron</title><path class=\"cls-1\" d=\"M122.88,61.44a61.44,61.44,0,1,0-61.44,61.44,61.44,61.44,0,0,0,61.44-61.44Z\" /><path class=\"cls-2\" d=\"M48.24,34.41c-12.48-2.27-22.35.11-26.28,6.92-2.94,5.09-2.1,11.83,2,19a1.28,1.28,0,1,0,2.22-1.27c-3.72-6.49-4.44-12.31-2-16.48,3.27-5.66,12.07-7.78,23.61-5.68L48,37a1.28,1.28,0,0,0,.25-2.54ZM30,71.64A80.13,80.13,0,0,0,49.11,86.7C67.21,97.16,86.49,100,96,93.47a1.26,1.26,0,0,0,.58-1.07,1.28,1.28,0,0,0-2-1C86,97.16,67.73,94.5,50.39,84.49A77.33,77.33,0,0,1,31.92,69.91a1.33,1.33,0,0,0-1-.42,1.28,1.28,0,0,0-1.28,1.28,1.33,1.33,0,0,0,.33.87Z\" /><path class=\"cls-2\" d=\"M93.42,67.56c8.17-9.65,11-19.37,7.1-26.16-2.89-5-9-7.65-17.11-7.75a1.28,1.28,0,0,0,0,2.56c7.3.09,12.56,2.37,14.92,6.47,3.26,5.64.72,14.3-6.84,23.23a1.28,1.28,0,1,0,2,1.65Zm-23-34.38a80.12,80.12,0,0,0-22.81,9C29,53,16.76,68.93,18.46,80.47A1.28,1.28,0,0,0,21,80.1C19.48,69.85,31,54.77,48.93,44.44A77.24,77.24,0,0,1,71,35.69a1.28,1.28,0,0,0-.24-2.54,1.36,1.36,0,0,0-.29,0Z\" /><path class=\"cls-2\" d=\"M42.13,90.12c4.27,11.93,11.26,19.28,19.13,19.28,5.73,0,11-3.91,15.17-10.79a1.21,1.21,0,0,0,.19-.67,1.28,1.28,0,0,0-2.38-.65c-3.72,6.19-8.29,9.55-13,9.55-6.53,0-12.77-6.55-16.72-17.58a1.28,1.28,0,0,0-2.49.41,1.16,1.16,0,0,0,.08.45Zm41.44-3.19A80.15,80.15,0,0,0,87,63.2C87,42,79.55,23.72,69,19a1.34,1.34,0,0,0-.49-.1,1.28,1.28,0,0,0-.55,2.44C77.37,25.55,84.42,42.9,84.42,63.2a77.92,77.92,0,0,1-3.29,23,1.34,1.34,0,0,0-.06.4,1.28,1.28,0,0,0,1.28,1.28,1.29,1.29,0,0,0,1.23-.92Zm21.67-2A6.13,6.13,0,1,0,99.11,91a6.12,6.12,0,0,0,6.13-6.12Zm-2.56,0a3.57,3.57,0,1,1-3.57-3.57,3.56,3.56,0,0,1,3.57,3.57Zm-79.4,7.75a6.13,6.13,0,1,0-6.13-6.13,6.13,6.13,0,0,0,6.13,6.13Zm0-2.56a3.57,3.57,0,1,1,3.57-3.57,3.57,3.57,0,0,1-3.57,3.57Z\" /><path class=\"cls-2\" d=\"M61.26,26.13A6.13,6.13,0,1,0,55.13,20a6.12,6.12,0,0,0,6.13,6.12Zm0-2.56A3.57,3.57,0,1,1,64.82,20a3.56,3.56,0,0,1-3.56,3.56Zm.93,37.69a4.43,4.43,0,0,1-5.27-3.39,4.92,4.92,0,0,1-.1-.94,4.43,4.43,0,1,1,5.37,4.33Z\" />","styles":[]});

const Sql_logo = createSvgComponent({"meta":{"src":"/_astro/sql_logo.BKdghDkd.svg","width":248,"height":127,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 247.63 127"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: none;\r\n        stroke: #df6c20;\r\n        stroke-width: 15px;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-1\" d=\"M62.63,32.5c0-13.81-11.19-25-25-25s-25,11.19-25,25h0c-.46,13.8,8.11,25.36,19.15,25.83,1.97.08,3.94-.2,5.85-.83,11.05-.11,20,11,20,24.8,0,.07,0,.13,0,.2-1.38,13.81-13.69,23.88-27.5,22.5-13.81-1.38-23.88-13.69-22.5-27.5h0\" />\r\n  <path class=\"cls-1\" d=\"M137.63,107.5c-27.25,4.48-52.97-13.98-57.45-41.22-4.48-27.25,13.98-52.97,41.23-57.45,27.25-4.48,52.97,13.98,57.45,41.22,3.5,21.31-7.07,42.47-26.23,52.45M137.63,82.5l30,40\" />\r\n  <path class=\"cls-1\" d=\"M202.63,2.5v80c0,13.81,11.19,25,25,25h20\" />\r\n","styles":[]});

const Windows_logo = createSvgComponent({"meta":{"src":"/_astro/windows_logo.BItS-gEF.svg","width":79,"height":79,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 78.97 78.97"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #2f76bc;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <rect class=\"cls-1\" width=\"37.43\" height=\"37.43\" rx=\"1.27\" ry=\"1.27\" />\r\n  <rect class=\"cls-1\" x=\"41.54\" width=\"37.43\" height=\"37.43\" rx=\"1.27\" ry=\"1.27\" />\r\n  <rect class=\"cls-1\" y=\"41.54\" width=\"37.43\" height=\"37.43\" rx=\"1.27\" ry=\"1.27\" />\r\n  <rect class=\"cls-1\" x=\"41.54\" y=\"41.54\" width=\"37.43\" height=\"37.43\" rx=\"1.27\" ry=\"1.27\" />\r\n","styles":[]});

const Tekkure_demo = new Proxy({"src":"/_astro/tekkure_demo.DIXKK8w9.jpg","width":1918,"height":1077,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/adaredu/Documents/densora/adardev/src/assets/demos/tekkure_demo.jpg";
							}
							if (target[name] !== undefined && globalThis.astroAsset) globalThis.astroAsset?.referencedImages?.add("C:/Users/adaredu/Documents/densora/adardev/src/assets/demos/tekkure_demo.jpg");
							return target[name];
						}
					});

const $$Projects = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Section", $$Section, { "id": "projects", "mt": "true", "mb": "true" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TitleSection", $$TitleSection, { "imageSrc": Code_icon, "title": "Proyectos" })} ${renderComponent($$result2, "Section", $$Section, { "extraClass": "w-full bg-backgroundPrimary rounded-2xl p-5 flex flex-col md:flex-row gap-6 shadow-xl", "padding": "false" }, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "Section", $$Section, { "extraClass": "w-full md:w-1/2 h-[250px] bg-white rounded-xl overflow-hidden flex items-center justify-center", "padding": "false" }, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "Image", $$Image, { "src": Tekkure_demo, "alt": "Preview Tekkure", "class": "object-cover w-full h-full" })} ` })} ${renderComponent($$result3, "Section", $$Section, { "extraClass": "w-full md:w-1/2 flex flex-col gap-4 justify-between", "padding": "false" }, { "default": ($$result4) => renderTemplate` ${renderComponent($$result4, "Section", $$Section, { "extraClass": "flex flex-row justify-between flex-wrap", "padding": "false" }, { "default": ($$result5) => renderTemplate` ${renderComponent($$result5, "Section", $$Section, { "extraClass": "flex flex-row items-center gap-5", "padding": "false" }, { "default": ($$result6) => renderTemplate` ${renderComponent($$result6, "Image", $$Image, { "src": Adardev_logo, "alt": "adardev logo", "width": 50, "height": 50 })} ${renderComponent($$result6, "Text", $$Text, { "text": "Bytemana", "type": "title" })} ` })} ${renderComponent($$result5, "Section", $$Section, { "extraClass": "flex flex-row mt-4 sm:mt-0", "padding": "false" }, { "default": ($$result6) => renderTemplate` ${renderComponent($$result6, "Section", $$Section, { "extraClass": "flex flex-row gap-2", "padding": "false" }, { "default": ($$result7) => renderTemplate` ${renderComponent($$result7, "Windows_logo", Windows_logo, { "width": "30px" })} ` })} ${renderComponent($$result6, "Section", $$Section, { "extraClass": "w-[2px] h-auto rounded-2xl bg-subtitle mx-4", "padding": "false" })} ${renderComponent($$result6, "Section", $$Section, { "extraClass": "flex flex-row gap-2", "padding": "false" }, { "default": ($$result7) => renderTemplate` ${renderComponent($$result7, "Php_logo", Php_logo, { "width": "30px" })} ${renderComponent($$result7, "Electron_logo", Electron_logo, { "width": "30px" })} ${renderComponent($$result7, "Sql_logo", Sql_logo, { "width": "30px" })} ` })} ` })} ` })} ${renderComponent($$result4, "Text", $$Text, { "text": "Sistema utilizado en un minisúper para la gestión de productos, usuarios y recursos en el almacén. Desarrollado con tecnologías web y empaquetado con Electron.", "type": "text" })} ${renderComponent($$result4, "Section", $$Section, { "extraClass": "flex justify-between", "padding": "false" }, { "default": ($$result5) => renderTemplate` ${renderComponent($$result5, "Section", $$Section, { "extraClass": "flex bg-backgroundSecondary px-4 py-2 rounded-2xl gap-3 items-center cursor-pointer hover:brightness-150 transition-colors", "padding": "false" }, { "default": ($$result6) => renderTemplate` ${renderComponent($$result6, "Github_logo", Github_logo, { "width": "25px" })} ${renderComponent($$result6, "Text", $$Text, { "text": "Ver código", "type": "mini" })} ` })} ${renderComponent($$result5, "Section", $$Section, { "extraClass": "flex bg-backgroundSecondary px-4 py-2 rounded-2xl gap-3 items-center cursor-pointer hover:brightness-150 transition-colors", "padding": "false" }, { "default": ($$result6) => renderTemplate` ${renderComponent($$result6, "Web_icon", Web_icon, { "width": "25px" })} ${renderComponent($$result6, "Text", $$Text, { "text": "Visitar", "type": "mini" })} ` })} ` })} ` })} ` })} ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/sections/projects.astro", void 0);

const Portfolio_icon$1 = createSvgComponent({"meta":{"src":"/_astro/portfolio_icon.C_-i8GrE.svg","width":1269,"height":1091,"format":"svg"},"attributes":{"id":"Layer_1","viewBox":"0 0 1268.6 1090.6"},"children":"\r\n  <defs>\r\n    <style>\r\n      .st0 {\r\n        fill: #cbeeeb;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"st0\" d=\"M1175,200.5h-214.3c-1.8,0-3.3-1.6-3.3-3.5v-93.1c0-53.2-40.4-96.3-90.2-96.3h-465.7c-49.9,0-90.2,43.1-90.2,96.3v93.1c0,1.9-1.5,3.5-3.3,3.5H93.8c-47.6,0-86.2,41.2-86.2,92.1v698.5c0,50.8,38.6,92.1,86.2,92.1h1081.3c47.6,0,86.1-41.2,86.1-91.9V292.4c0-50.8-38.6-91.9-86.1-91.9h0ZM700.1,653.5v75.4c0,10.6-8.1,19.2-18,19.2h-95.5c-10,0-18-8.6-18-19.2v-174.2c0-10.6,8.1-19.2,18-19.2h95.5c10,0,18,8.6,18,19.2v98.8h0ZM529.8,513.3v79.6c0,10.6-8.1,19.2-18,19.2h-237c-60.4,0-109.4-52.3-109.4-116.8v-234.2c0-10.6,8.1-19.2,18-19.2h902c10,0,18,8.6,18,19.2v234.2c0,64.5-49,116.8-109.4,116.8h-237c-10,0-18-8.6-18-19.2v-79.6c0-10.6-8.1-19.2-18-19.2h-173c-10,0-18,8.6-18,19.2h0ZM350,119.6c0-39.1,29.6-70.7,66.2-70.7h436.2c36.6,0,66.2,31.7,66.2,70.7v61.6c0,10.6-8.1,19.2-18,19.2H368.1c-10,0-18-8.6-18-19.2v-61.6ZM1222.4,975.4c0,36.6-27.8,66.3-62.1,66.3H90.5c-24.4,0-44.2-21.2-44.2-47.2V308.3c0-36.7,27.9-66.4,62.2-66.4h0c10,0,18,8.6,18,19.2v234.2c0,87,66.7,158.2,148.2,158.2h237c10,0,18,8.6,18,19.2v97.5c0,10.6,8.1,19.2,18,19.2h173c10,0,18-8.6,18-19.2v-97.5c0-10.6,8.1-19.2,18-19.2h237.2c81.8,0,148-70.8,148-158v-234.4c0-10.6,8.1-19.2,18-19.2h18.2c24.3,0,44.1,21.1,44.1,47.2v686.4h0Z\" />\r\n  <path class=\"st0\" d=\"M1175,1090.6H93.8c-51.7,0-93.8-44.7-93.8-99.6V292.5c0-54.9,42.1-99.6,93.8-99.6h210v-89.1C303.8,46.6,347.6,0,401.5,0h465.7c53.9,0,97.8,46.6,97.8,103.8v89.1h217.5v.3c48.1,4.1,86.1,47,86.1,99.1v698.8c0,54.8-42,99.4-93.6,99.4ZM93.8,208c-43.4,0-78.8,37.9-78.8,84.6v698.5c0,46.6,35.3,84.6,78.8,84.6h1081.3c43.4,0,78.6-37.9,78.6-84.4V292.4c0-46.5-35.3-84.4-78.6-84.4h-214.3c-5.9,0-10.8-4.9-10.8-11v-93.1c0-49-37.1-88.8-82.8-88.8h-465.7c-45.6,0-82.8,39.9-82.8,88.8v93.1c0,6.1-4.8,11-10.8,11H93.8ZM1160.3,1049.2H90.5c-28.5,0-51.7-24.5-51.7-54.7V308.3c0-40.8,31.3-73.9,69.7-73.9s25.5,12,25.5,26.7v234.2c0,83.1,63.1,150.7,140.7,150.7h237c14.1,0,25.5,12,25.5,26.7v97.5c0,6.5,4.7,11.7,10.5,11.7h173c5.8,0,10.5-5.3,10.5-11.7v-97.5c0-14.7,11.5-26.7,25.5-26.7h237.2c77.5,0,140.5-67.5,140.5-150.5v-234.4c0-14.7,11.5-26.7,25.5-26.7h18.2c28.4,0,51.6,24.5,51.6,54.7v686.4c0,40.7-31.2,73.8-69.6,73.8ZM108.5,249.4c-30.2,0-54.7,26.4-54.7,58.9v686.3c0,21.9,16.5,39.7,36.7,39.7h1069.8c30.1,0,54.6-26.4,54.6-58.8V289c0-21.9-16.4-39.7-36.6-39.7h-18.2c-5.8,0-10.5,5.3-10.5,11.7v234.4c0,91.3-69.8,165.5-155.5,165.5h-237.2c-5.8,0-10.5,5.3-10.5,11.7v97.5c0,14.7-11.5,26.7-25.5,26.7h-173c-14.1,0-25.5-12-25.5-26.7v-97.5c0-6.5-4.7-11.7-10.5-11.7h-237c-41.5,0-80.6-17.3-110.1-48.8-29.4-31.4-45.6-72.8-45.6-116.8v-234.2c0-6.5-4.7-11.7-10.5-11.7ZM682.1,755.7h-95.5c-14.1,0-25.5-12-25.5-26.7v-174.2c0-14.7,11.5-26.7,25.5-26.7h95.5c14.1,0,25.5,12,25.5,26.7v174.2c0,14.7-11.5,26.7-25.5,26.7ZM586.6,542.9c-5.8,0-10.5,5.3-10.5,11.7v174.2c0,6.5,4.7,11.7,10.5,11.7h95.5c5.8,0,10.5-5.3,10.5-11.7v-174.2c0-6.5-4.7-11.7-10.5-11.7h-95.5ZM993.9,619.6h-237c-14.1,0-25.5-12-25.5-26.7v-79.6c0-6.5-4.7-11.7-10.5-11.7h-173c-5.8,0-10.5,5.3-10.5,11.7v79.6c0,14.7-11.5,26.7-25.5,26.7h-237c-64.5,0-116.9-55.8-116.9-124.3v-234.2c0-14.7,11.5-26.7,25.5-26.7h902c14.1,0,25.5,12,25.5,26.7v234.2c0,68.5-52.4,124.3-116.9,124.3ZM547.8,486.5h173c14.1,0,25.5,12,25.5,26.7v79.6c0,6.5,4.7,11.7,10.5,11.7h237c56.2,0,101.9-49,101.9-109.3v-234.2c0-6.5-4.7-11.7-10.5-11.7H183.3c-5.8,0-10.5,5.3-10.5,11.7v234.2c0,60.3,45.7,109.3,101.9,109.3h237c5.8,0,10.5-5.3,10.5-11.7v-79.6c0-14.7,11.5-26.7,25.5-26.7ZM900.7,208H368.1c-14.1,0-25.5-12-25.5-26.7v-61.6c0-43.1,33.1-78.2,73.7-78.2h436.2c40.7,0,73.7,35.1,73.7,78.2v61.6c0,14.7-11.5,26.7-25.5,26.7ZM416.3,56.4c-32.4,0-58.7,28.4-58.7,63.2v61.6c0,6.5,4.7,11.7,10.5,11.7h532.6c5.8,0,10.5-5.3,10.5-11.7v-61.6c0-34.8-26.4-63.2-58.7-63.2h-436.2Z\" />\r\n","styles":[]});

const Cpp_logo = createSvgComponent({"meta":{"src":"/_astro/cpp_logo.ikyUdW5V.svg","width":2222,"height":2500,"format":"svg"},"attributes":{"width":"2222","height":"2500","viewBox":"0 0 256 288","preserveAspectRatio":"xMinYMin meet"},"children":"<path d=\"M255.569 84.72c-.002-4.83-1.035-9.098-3.124-12.761-2.052-3.602-5.125-6.621-9.247-9.008-34.025-19.619-68.083-39.178-102.097-58.817-9.17-5.294-18.061-5.101-27.163.269C100.395 12.39 32.59 51.237 12.385 62.94 4.064 67.757.015 75.129.013 84.711 0 124.166.013 163.62 0 203.076c.002 4.724.991 8.909 2.988 12.517 2.053 3.711 5.169 6.813 9.386 9.254 20.206 11.703 88.02 50.547 101.56 58.536 9.106 5.373 17.997 5.565 27.17.269 34.015-19.64 68.075-39.198 102.105-58.817 4.217-2.44 7.333-5.544 9.386-9.252 1.994-3.608 2.985-7.793 2.987-12.518 0 0 0-78.889-.013-118.345\" fill=\"#5C8DBC\" /><path d=\"M128.182 143.509L2.988 215.593c2.053 3.711 5.169 6.813 9.386 9.254 20.206 11.703 88.02 50.547 101.56 58.536 9.106 5.373 17.997 5.565 27.17.269 34.015-19.64 68.075-39.198 102.105-58.817 4.217-2.44 7.333-5.544 9.386-9.252l-124.413-72.074\" fill=\"#1A4674\" /><path d=\"M91.101 164.861c7.285 12.718 20.98 21.296 36.69 21.296 15.807 0 29.58-8.687 36.828-21.541l-36.437-21.107-37.081 21.352\" fill=\"#1A4674\" /><path d=\"M255.569 84.72c-.002-4.83-1.035-9.098-3.124-12.761l-124.263 71.55 124.413 72.074c1.994-3.608 2.985-7.793 2.987-12.518 0 0 0-78.889-.013-118.345\" fill=\"#1B598E\" /><path d=\"M248.728 148.661h-9.722v9.724h-9.724v-9.724h-9.721v-9.721h9.721v-9.722h9.724v9.722h9.722v9.721M213.253 148.661h-9.721v9.724h-9.722v-9.724h-9.722v-9.721h9.722v-9.722h9.722v9.722h9.721v9.721\" fill=\"#FFF\" /><path d=\"M164.619 164.616c-7.248 12.854-21.021 21.541-36.828 21.541-15.71 0-29.405-8.578-36.69-21.296a42.062 42.062 0 0 1-5.574-20.968c0-23.341 18.923-42.263 42.264-42.263 15.609 0 29.232 8.471 36.553 21.059l36.941-21.272c-14.683-25.346-42.096-42.398-73.494-42.398-46.876 0-84.875 38-84.875 84.874 0 15.378 4.091 29.799 11.241 42.238 14.646 25.48 42.137 42.637 73.634 42.637 31.555 0 59.089-17.226 73.714-42.781l-36.886-21.371\" fill=\"#FFF\" />","styles":[]});

const Csharp = createSvgComponent({"meta":{"src":"/_astro/csharp_logo.Co0i4_C5.svg","width":2222,"height":2500,"format":"svg"},"attributes":{"height":"2500","preserveAspectRatio":"xMidYMid","viewBox":"0 -1.428 255.582 290.108","width":"2222"},"children":"<path d=\"m255.569 84.452c-.002-4.83-1.035-9.098-3.124-12.76-2.052-3.603-5.125-6.622-9.247-9.009-34.025-19.619-68.083-39.178-102.097-58.817-9.17-5.294-18.061-5.1-27.163.27-13.543 7.986-81.348 46.833-101.553 58.536-8.321 4.818-12.37 12.19-12.372 21.771-.013 39.455 0 78.91-.013 118.365 0 4.724.991 8.91 2.988 12.517 2.053 3.711 5.169 6.813 9.386 9.254 20.206 11.703 88.02 50.547 101.56 58.536 9.106 5.373 17.997 5.565 27.17.27 34.015-19.64 68.075-39.199 102.105-58.818 4.217-2.44 7.333-5.544 9.386-9.252 1.994-3.608 2.987-7.793 2.987-12.518 0 0 0-78.889-.013-118.345\" fill=\"#a179dc\" /><path d=\"m128.182 143.241-125.194 72.084c2.053 3.711 5.169 6.813 9.386 9.254 20.206 11.703 88.02 50.547 101.56 58.536 9.106 5.373 17.997 5.565 27.17.27 34.015-19.64 68.075-39.199 102.105-58.818 4.217-2.44 7.333-5.544 9.386-9.252z\" fill=\"#280068\" /><path d=\"m255.569 84.452c-.002-4.83-1.035-9.098-3.124-12.76l-124.263 71.55 124.413 72.073c1.994-3.608 2.985-7.793 2.987-12.518 0 0 0-78.889-.013-118.345\" fill=\"#390091\" /><g fill=\"#fff\"><path d=\"m201.892 116.294v13.474h13.474v-13.474h6.737v13.474h13.474v6.737h-13.474v13.473h13.474v6.737h-13.474v13.474h-6.737v-13.474h-13.474v13.474h-6.737v-13.474h-13.473v-6.737h13.473v-13.473h-13.473v-6.737h13.473v-13.474zm13.474 20.21h-13.474v13.474h13.474z\" /><path d=\"m128.457 48.626c35.144 0 65.827 19.086 82.262 47.456l-.16-.273-41.35 23.808c-8.146-13.793-23.08-23.102-40.213-23.294l-.54-.003c-26.125 0-47.305 21.18-47.305 47.305a47.08 47.08 0 0 0 6.239 23.47c8.154 14.235 23.483 23.836 41.067 23.836 17.693 0 33.109-9.723 41.221-24.11l-.197.345 41.287 23.918c-16.255 28.13-46.518 47.157-81.253 47.536l-1.058.006c-35.255 0-66.025-19.204-82.419-47.724-8.003-13.923-12.582-30.064-12.582-47.277 0-52.466 42.532-95 95-95z\" /></g>","styles":[]});

const Python = createSvgComponent({"meta":{"src":"/_astro/python_logo.BV-bzvXq.svg","width":700,"height":696,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 700 695.6"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: url(#linear-gradient-2);\r\n      }\r\n      .cls-2 {\r\n        fill: url(#linear-gradient);\r\n      }\r\n    </style>\r\n    <linearGradient id=\"linear-gradient\" x1=\"166.66\" y1=\"600.78\" x2=\"166.73\" y2=\"600.71\" gradientTransform=\"translate(-788973.52 2850937.49) scale(4734.5 -4745.25)\" gradientUnits=\"userSpaceOnUse\">\r\n      <stop offset=\"0\" stop-color=\"#387eb8\" />\r\n      <stop offset=\"1\" stop-color=\"#366994\" />\r\n    </linearGradient>\r\n    <linearGradient id=\"linear-gradient-2\" x1=\"166.35\" y1=\"601.08\" x2=\"166.43\" y2=\"601.01\" gradientTransform=\"translate(-787323.52 2852543.74) scale(4734.5 -4745.25)\" gradientUnits=\"userSpaceOnUse\">\r\n      <stop offset=\"0\" stop-color=\"#ffe052\" />\r\n      <stop offset=\"1\" stop-color=\"#ffc331\" />\r\n    </linearGradient>\r\n  </defs>\r\n  <path class=\"cls-2\" d=\"M347.13.3C169.62.3,180.85,77.05,180.85,77.05v79.75h168.8v25H113.63S0,167.8,0,347.92s100.33,172.8,100.33,172.8h57.92v-84.03s-3.25-100.33,97.5-100.33h169.05s94.3,1.5,94.3-91.3V92.8S533.4,0,348.05,0h0l-.92.3ZM253.82,53.72c16.76-.42,30.68,12.82,31.11,29.57.42,16.76-12.82,30.68-29.57,31.11s-30.68-12.82-31.11-29.57c0,0,0,0,0,0v-.5c0-16.76,13.59-30.35,30.35-30.35h0l-.78-.25Z\" />\r\n  <path class=\"cls-1\" d=\"M352.12,695.55c177.5,0,166.28-77,166.28-77v-79.5h-168.78v-25h236.75s113.63,12.7,113.63-166.37-100.33-172.8-100.33-172.8h-58.68v82.92s3.25,100.33-97.5,100.33h-169.12s-94.38-1.42-94.38,91.38v153.3s-14.3,92.8,171.05,92.8h1l.07-.05ZM445.42,641.88c-16.76.42-30.68-12.82-31.11-29.57-.42-16.76,12.82-30.68,29.57-31.11,16.76-.42,30.68,12.82,31.11,29.57,0,0,0,0,0,0v.75c0,16.76-13.59,30.35-30.35,30.35h0,.78Z\" />\r\n","styles":[]});

const Java_logo = createSvgComponent({"meta":{"src":"/_astro/java_logo.C8EWvIS5.svg","width":64,"height":64,"format":"svg"},"attributes":{"width":"64","height":"64","viewBox":"0 0 32 32"},"children":"<path d=\"M11.622 24.74s-1.23.748.855.962c2.51.32 3.847.267 6.625-.267a10.02 10.02 0 0 0 1.763.855c-6.25 2.672-14.16-.16-9.244-1.55zm-.8-3.473s-1.336 1.015.748 1.23c2.725.267 4.862.32 8.55-.427a3.26 3.26 0 0 0 1.282.801c-7.534 2.244-15.976.214-10.58-1.603zm14.747 6.09s.908.748-1.015 1.336c-3.58 1.07-15.014 1.39-18.22 0-1.122-.48 1.015-1.175 1.7-1.282.695-.16 1.07-.16 1.07-.16-1.23-.855-8.175 1.763-3.526 2.51 12.77 2.084 23.296-.908 19.983-2.404zM12.2 17.633s-5.824 1.39-2.084 1.87c1.603.214 4.755.16 7.694-.053 2.404-.214 4.81-.64 4.81-.64s-.855.374-1.443.748c-5.93 1.55-17.312.855-14.052-.748 2.778-1.336 5.076-1.175 5.076-1.175zm10.42 5.824c5.984-3.1 3.206-6.09 1.282-5.717-.48.107-.695.214-.695.214s.16-.32.534-.427c3.794-1.336 6.786 4.007-1.23 6.09 0 0 .053-.053.107-.16zm-9.83 8.442c5.77.374 14.587-.214 14.8-2.94 0 0-.427 1.07-4.755 1.87-4.916.908-11.007.8-14.587.214 0 0 .748.64 4.542.855z\" fill=\"#4e7896\" /><path d=\"M18.996.001s3.313 3.366-3.152 8.442c-5.183 4.114-1.175 6.465 0 9.137-3.046-2.725-5.236-5.13-3.74-7.373C14.294 6.893 20.332 5.3 18.996.001zm-1.7 15.335c1.55 1.763-.427 3.366-.427 3.366s3.954-2.03 2.137-4.542c-1.656-2.404-2.94-3.58 4.007-7.587 0 0-10.953 2.725-5.717 8.763z\" fill=\"#f58219\" />","styles":[]});

const Docker_logo = createSvgComponent({"meta":{"src":"/_astro/docker_logo.DA_68Z6r.svg","width":756,"height":597,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 756.26 596.9"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #1d63ed;\r\n        stroke-width: 0px;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-1\" d=\"M743.96,245.25c-18.54-12.48-67.26-17.81-102.68-8.27-1.91-35.28-20.1-65.01-53.38-90.95l-12.32-8.27-8.21,12.4c-16.14,24.5-22.94,57.14-20.53,86.81,1.9,18.28,8.26,38.83,20.53,53.74-46.1,26.74-88.59,20.67-276.77,20.67H.06c-.85,42.49,5.98,124.23,57.96,190.77,5.74,7.35,12.04,14.46,18.87,21.31,42.26,42.32,106.11,73.35,201.59,73.44,145.66.13,270.46-78.6,346.37-268.97,24.98.41,90.92,4.48,123.19-57.88.79-1.05,8.21-16.54,8.21-16.54l-12.3-8.27ZM189.67,206.39h-81.7v81.7h81.7v-81.7ZM295.22,206.39h-81.7v81.7h81.7v-81.7ZM400.77,206.39h-81.7v81.7h81.7v-81.7ZM506.32,206.39h-81.7v81.7h81.7v-81.7ZM84.12,206.39H2.42v81.7h81.7v-81.7ZM189.67,103.2h-81.7v81.7h81.7v-81.7ZM295.22,103.2h-81.7v81.7h81.7v-81.7ZM400.77,103.2h-81.7v81.7h81.7v-81.7ZM400.77,0h-81.7v81.7h81.7V0Z\" />\r\n","styles":[]});

const Xd_logo = createSvgComponent({"meta":{"src":"/_astro/xd_logo.U7-nzqRT.svg","width":33,"height":32,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 33.27 32.43"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #460437;\r\n      }\r\n      .cls-2 {\r\n        fill: #cb74af;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <g id=\"Layer_2\" data-name=\"Layer 2\">\r\n    <g id=\"Surfaces\">\r\n      <g id=\"UI_UX_Surface\" data-name=\"UI UX Surface\">\r\n        <g id=\"Outline_no_shadow\" data-name=\"Outline no shadow\">\r\n          <rect class=\"cls-1\" width=\"33.27\" height=\"32.43\" rx=\"5.89\" ry=\"5.89\" />\r\n        </g>\r\n      </g>\r\n    </g>\r\n    <g id=\"Outlined_Mnemonics_Logos\" data-name=\"Outlined Mnemonics Logos\">\r\n      <g id=\"Xd\">\r\n        <path class=\"cls-2\" d=\"M17.49,8.53l-4.15,6.85,4.44,7.27c.03.05.04.11.02.17-.02.05-.07.02-.16.03h-3.17c-.22,0-.38,0-.47-.16-.3-.58-.6-1.16-.89-1.73-.3-.57-.61-1.16-.95-1.75-.33-.59-.67-1.2-.99-1.81h-.02c-.3.6-.61,1.19-.93,1.79-.32.6-.64,1.19-.95,1.77-.31.59-.63,1.17-.96,1.75-.06.13-.16.15-.31.15h-3.06c-.06,0-.09.02-.1-.04,0-.05,0-.11.03-.16l4.31-7.07-4.2-7.1c-.04-.06-.05-.11-.02-.15.03-.04.08-.06.13-.06h3.15c.07,0,.14,0,.2.03.05.03.1.07.13.12.27.6.57,1.19.89,1.79.33.6.66,1.18.99,1.76.33.58.64,1.17.93,1.76h.02c.3-.61.6-1.2.9-1.79.3-.58.62-1.16.94-1.75.32-.59.63-1.17.93-1.75.02-.06.05-.1.09-.15.06-.03.12-.04.18-.03h2.92c.07-.02.14.02.15.09.01.05,0,.1-.04.13h0Z\" />\r\n        <path class=\"cls-2\" d=\"M23.89,23.15c-1.03.02-2.04-.2-2.98-.62-.87-.4-1.6-1.06-2.09-1.89-.51-.84-.76-1.89-.76-3.16,0-1.02.25-2.03.76-2.92.52-.91,1.29-1.65,2.21-2.14.97-.54,2.13-.8,3.5-.8.07,0,.17,0,.29.01.12,0,.26.02.42.03v-4.4c0-.1.04-.16.13-.16h2.81c.06,0,.12.04.13.1,0,.01,0,.02,0,.03v13.19c0,.25.01.53.03.83.02.3.04.57.06.8,0,.09-.05.18-.13.22-.73.3-1.48.53-2.25.67-.71.13-1.42.2-2.14.2ZM25.25,20.38v-6.09c-.12-.03-.24-.06-.37-.07-.15-.02-.3-.02-.46-.02-.54,0-1.08.12-1.56.36-.47.24-.88.59-1.17,1.03-.31.45-.46,1.03-.46,1.76-.01.49.07.97.23,1.43.13.37.35.7.62.98.26.26.59.45.94.56.37.12.76.18,1.15.18.21,0,.4,0,.58-.02.17-.01.33-.04.49-.09Z\" />\r\n      </g>\r\n    </g>\r\n  </g>\r\n","styles":[]});

const Photoshop_logo = createSvgComponent({"meta":{"src":"/_astro/photoshop_logo.Dj4x8_26.svg","width":46,"height":45,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 46.2 45.05"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #56a1d8;\r\n      }\r\n\r\n      .cls-2 {\r\n        fill: #071f35;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <g id=\"Layer_2\" data-name=\"Layer 2\">\r\n    <g id=\"Surfaces\">\r\n      <g id=\"Photo_Surface\" data-name=\"Photo Surface\">\r\n        <g id=\"Outline_no_shadow\" data-name=\"Outline no shadow\">\r\n          <rect class=\"cls-2\" width=\"46.2\" height=\"45.05\" rx=\"8.18\" ry=\"8.18\" />\r\n        </g>\r\n      </g>\r\n    </g>\r\n    <g id=\"Outlined_Mnemonics_Logos\" data-name=\"Outlined Mnemonics Logos\">\r\n      <g id=\"Ps\">\r\n        <path class=\"cls-1\" d=\"M10.4,31.59V11.78c0-.14.06-.22.19-.22.33,0,.63,0,1.09-.02.45-.01.95-.02,1.47-.03.53-.01,1.08-.02,1.67-.03.59-.01,1.17-.02,1.75-.02,1.57,0,2.89.2,3.97.59.97.33,1.85.87,2.59,1.58.62.62,1.1,1.36,1.41,2.19.29.8.44,1.64.43,2.49,0,1.65-.38,3.02-1.15,4.09-.77,1.08-1.85,1.9-3.1,2.34-1.3.49-2.75.65-4.34.65-.45,0-.78,0-.96-.02-.19-.01-.46-.02-.84-.02v6.18c.02.13-.07.26-.21.28-.02,0-.05,0-.07,0h-3.69c-.14,0-.22-.08-.22-.25ZM14.59,15.29v6.46c.27.02.52.03.74.03h1.02c.75,0,1.5-.12,2.22-.35.61-.18,1.16-.54,1.58-1.02.4-.48.6-1.14.6-1.98.02-.6-.14-1.19-.45-1.7-.33-.5-.8-.88-1.35-1.1-.72-.28-1.49-.41-2.26-.39-.5,0-.94,0-1.32.02-.38.01-.65.03-.79.05h0Z\" />\r\n        <path class=\"cls-1\" d=\"M36.96,20.57c-.58-.3-1.2-.52-1.84-.65-.71-.16-1.43-.25-2.15-.25-.39-.01-.78.04-1.16.14-.24.05-.46.19-.6.39-.1.16-.15.34-.15.53,0,.18.07.36.19.5.18.21.4.39.65.51.44.24.9.45,1.36.64,1.04.35,2.03.82,2.96,1.41.63.4,1.15.95,1.52,1.6.31.62.46,1.3.45,1.98.02.91-.24,1.8-.74,2.56-.54.77-1.29,1.37-2.15,1.72-.94.41-2.1.62-3.49.62-.88,0-1.76-.07-2.62-.25-.68-.12-1.34-.33-1.97-.62-.14-.07-.22-.22-.22-.37v-3.35c0-.07.02-.13.08-.17.05-.03.12-.02.17.02.74.44,1.55.76,2.39.95.74.19,1.5.28,2.26.29.72,0,1.26-.09,1.6-.28.31-.14.52-.46.51-.81,0-.27-.15-.53-.46-.77-.31-.25-.94-.55-1.89-.9-.97-.34-1.9-.81-2.74-1.39-.61-.42-1.1-.98-1.46-1.63-.3-.61-.46-1.29-.45-1.97,0-.82.22-1.62.65-2.32.49-.77,1.19-1.38,2.01-1.77.91-.45,2.05-.68,3.41-.68.8,0,1.6.05,2.39.17.57.07,1.13.22,1.66.45.09.02.15.09.19.17.02.08.03.15.03.23v3.13c0,.07-.03.14-.09.19-.08.04-.18.04-.27,0Z\" />\r\n      </g>\r\n    </g>\r\n  </g>\r\n","styles":[]});

const Ilustrator_logo = createSvgComponent({"meta":{"src":"/_astro/ilustrator_logo.CC4N_RjI.svg","width":59,"height":58,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 59.48 57.99"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #f89a1c;\r\n      }\r\n      .cls-2 {\r\n        fill: #301111;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <g id=\"Layer_2\" data-name=\"Layer 2\">\r\n    <g id=\"Surfaces\">\r\n      <g id=\"Drawing_Surface\" data-name=\"Drawing Surface\">\r\n        <g id=\"Outline_no_shadow\" data-name=\"Outline no shadow\">\r\n          <rect class=\"cls-2\" width=\"59.48\" height=\"57.99\" rx=\"10.53\" ry=\"10.53\" />\r\n        </g>\r\n      </g>\r\n    </g>\r\n    <g id=\"Outlined_Mnemonics_Logos\" data-name=\"Outlined Mnemonics Logos\">\r\n      <g id=\"Ai\">\r\n        <path class=\"cls-1\" d=\"M28.82,34.8h-9.22l-1.88,5.83c-.05.22-.25.37-.48.36h-4.67c-.27,0-.36-.15-.28-.44l7.98-22.98c.08-.24.16-.51.24-.82.1-.53.16-1.07.16-1.62-.02-.14.07-.26.21-.28.02,0,.05,0,.07,0h6.34c.19,0,.29.07.32.2l9.06,25.54c.08.27,0,.4-.24.4h-5.19c-.18.02-.36-.1-.4-.28l-2.03-5.91ZM21.04,29.77h6.3c-.16-.53-.35-1.13-.56-1.8-.21-.66-.44-1.38-.68-2.13-.24-.76-.48-1.52-.72-2.27-.24-.76-.46-1.49-.66-2.19-.2-.7-.38-1.35-.54-1.94h-.04c-.22,1.08-.5,2.14-.84,3.19-.37,1.2-.75,2.42-1.14,3.67-.39,1.25-.76,2.41-1.14,3.47h0Z\" />\r\n        <path class=\"cls-1\" d=\"M42.07,19.08c-.82.03-1.62-.29-2.19-.88-.57-.62-.87-1.43-.84-2.27-.03-.83.3-1.64.9-2.21.59-.57,1.39-.88,2.21-.86.96,0,1.71.29,2.25.86.56.6.85,1.4.82,2.21.03.84-.28,1.66-.86,2.27-.61.6-1.44.92-2.29.88ZM39.32,40.59v-19.07c0-.24.11-.36.32-.36h4.91c.21,0,.32.12.32.36v19.07c0,.27-.11.4-.32.4h-4.87c-.24,0-.36-.13-.36-.4Z\" />\r\n      </g>\r\n    </g>\r\n  </g>\r\n","styles":[]});

const Notion_logo = createSvgComponent({"meta":{"src":"/_astro/notion_logo.V7ldwI4A.svg","width":800,"height":800,"format":"svg"},"attributes":{"id":"Layer_1","viewBox":"0 0 800 800"},"children":"\r\n  <defs>\r\n    <style>\r\n      .st0 {\r\n        fill: #fff;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"st0\" d=\"M173.75,166.23c22.39,18.19,30.8,16.8,72.85,14l396.45-23.8c8.41,0,1.41-8.39-1.39-9.78l-65.85-47.6c-12.61-9.79-29.42-21.01-61.64-18.21l-383.88,28c-14,1.39-16.8,8.39-11.22,14l54.67,43.39ZM197.55,258.62v417.13c0,22.42,11.2,30.81,36.42,29.42l435.69-25.21c25.23-1.39,28.04-16.81,28.04-35.02V230.61c0-18.18-6.99-27.99-22.44-26.59l-455.31,26.59c-16.8,1.41-22.41,9.82-22.41,28.01ZM627.67,281c2.79,12.61,0,25.21-12.63,26.63l-20.99,4.18v307.95c-18.23,9.8-35.03,15.4-49.04,15.4-22.42,0-28.04-7-44.84-27.99l-137.32-215.57v208.57l43.45,9.8s0,25.18-35.06,25.18l-96.64,5.61c-2.81-5.61,0-19.59,9.8-22.39l25.22-6.99v-275.77l-35.02-2.81c-2.81-12.61,4.19-30.79,23.81-32.2l103.68-6.99,142.9,218.37v-193.18l-36.44-4.18c-2.8-15.42,8.4-26.61,22.41-28l96.7-5.63ZM98.07,71.05l399.3-29.4c49.04-4.21,61.65-1.39,92.47,21l127.46,89.59c21.03,15.41,28.04,19.6,28.04,36.39v491.34c0,30.79-11.22,49-50.44,51.79l-463.7,28.01c-29.44,1.4-43.45-2.79-58.87-22.41l-93.86-121.78c-16.82-22.42-23.81-39.19-23.81-58.81V120.02c0-25.18,11.22-46.19,43.42-48.98Z\" />\r\n","styles":[]});

const Dart_logo = createSvgComponent({"meta":{"src":"/_astro/dart_logo.DmExqnfL.svg","width":64,"height":64,"format":"svg"},"attributes":{"width":"64","height":"64"},"children":"<path d=\"M17.582 17.424l-4.138-4.14.016 29.903.05 1.396c.02.66.145 1.4.345 2.17l32.775 11.56 8.2-3.63.007-.012L17.58 17.424z\" fill=\"#00c4b3\" /><path d=\"M13.856 46.753h.003c-.003-.012-.008-.026-.014-.04.007.015.007.03.01.04zm40.966 7.93l-8.2 3.63-32.77-11.56c.625 2.404 2.012 5.106 3.502 6.58l10.69 10.637 23.788.03 2.98-9.317z\" fill=\"#22d3c5\" /><g fill=\"#0075c9\"><path d=\"M13.556 13.285L.813 32.53c-1.058 1.13-.53 3.462 1.173 5.18l7.356 7.416 4.624 1.63c-.2-.768-.326-1.5-.345-2.17l-.05-1.396-.015-29.903z\" /><path d=\"M46.9 13.67c-.77-.195-1.508-.318-2.173-.337l-1.478-.054-29.805.007 41.392 41.386 3.636-8.2-11.57-32.8z\" /></g><path d=\"M46.862 13.663c.013.005.027.008.038.01v-.004c-.013-.003-.025-.003-.038-.008zm6.615 3.518c-1.505-1.515-4.17-2.9-6.577-3.508L58.47 46.47l-3.64 8.2 8.882-2.838.02-24.352-10.256-10.3z\" fill=\"#00a8e1\" /><path d=\"M45.278 9.075l-7.4-7.36C36.152.018 33.82-.512 32.7.544l-19.244 12.74 29.805-.007 1.478.054c.665.02 1.404.142 2.173.337L45.28 9.073zm-31.833 4.2\" fill=\"#00c4b3\" />","styles":[]});

const Astro_logo = createSvgComponent({"meta":{"src":"/_astro/astro_logo.Dt9yIXt9.svg","width":85,"height":107,"format":"svg"},"attributes":{"width":"85","height":"107","viewBox":"0 0 85 107","fill":"none"},"children":"\r\n<path d=\"M27.5894 91.1365C22.7555 86.7178 21.3444 77.4335 23.3583 70.7072C26.8503 74.948 31.6888 76.2914 36.7005 77.0497C44.4375 78.2199 52.0359 77.7822 59.2232 74.2459C60.0454 73.841 60.8052 73.3027 61.7036 72.7574C62.378 74.714 62.5535 76.6892 62.318 78.6996C61.7452 83.5957 59.3086 87.3778 55.4332 90.2448C53.8835 91.3916 52.2437 92.4167 50.6432 93.4979C45.7262 96.8213 44.3959 100.718 46.2435 106.386C46.2874 106.525 46.3267 106.663 46.426 107C43.9155 105.876 42.0817 104.24 40.6845 102.089C39.2087 99.8193 38.5066 97.3081 38.4696 94.5909C38.4511 93.2686 38.4511 91.9345 38.2733 90.6309C37.8391 87.4527 36.3471 86.0297 33.5364 85.9478C30.6518 85.8636 28.37 87.6469 27.7649 90.4554C27.7187 90.6707 27.6517 90.8837 27.5847 91.1341L27.5894 91.1365Z\" fill=\"white\" />\r\n<path d=\"M27.5894 91.1365C22.7555 86.7178 21.3444 77.4335 23.3583 70.7072C26.8503 74.948 31.6888 76.2914 36.7005 77.0497C44.4375 78.2199 52.0359 77.7822 59.2232 74.2459C60.0454 73.841 60.8052 73.3027 61.7036 72.7574C62.378 74.714 62.5535 76.6892 62.318 78.6996C61.7452 83.5957 59.3086 87.3778 55.4332 90.2448C53.8835 91.3916 52.2437 92.4167 50.6432 93.4979C45.7262 96.8213 44.3959 100.718 46.2435 106.386C46.2874 106.525 46.3267 106.663 46.426 107C43.9155 105.876 42.0817 104.24 40.6845 102.089C39.2087 99.8193 38.5066 97.3081 38.4696 94.5909C38.4511 93.2686 38.4511 91.9345 38.2733 90.6309C37.8391 87.4527 36.3471 86.0297 33.5364 85.9478C30.6518 85.8636 28.37 87.6469 27.7649 90.4554C27.7187 90.6707 27.6517 90.8837 27.5847 91.1341L27.5894 91.1365Z\" fill=\"url(#paint0_linear_1_59)\" />\r\n<path d=\"M0 69.5866C0 69.5866 14.3139 62.6137 28.6678 62.6137L39.4901 29.1204C39.8953 27.5007 41.0783 26.3999 42.4139 26.3999C43.7495 26.3999 44.9325 27.5007 45.3377 29.1204L56.1601 62.6137C73.1601 62.6137 84.8278 69.5866 84.8278 69.5866C84.8278 69.5866 60.5145 3.35233 60.467 3.21944C59.7692 1.2612 58.5911 0 57.0029 0H27.8274C26.2392 0 25.1087 1.2612 24.3634 3.21944C24.3108 3.34983 0 69.5866 0 69.5866Z\" fill=\"white\" />\r\n<defs>\r\n<linearGradient id=\"paint0_linear_1_59\" x1=\"22.4702\" y1=\"107\" x2=\"69.1451\" y2=\"84.9468\" gradientUnits=\"userSpaceOnUse\">\r\n<stop stop-color=\"#D83333\" />\r\n<stop offset=\"1\" stop-color=\"#F041FF\" />\r\n</linearGradient>\r\n</defs>\r\n","styles":[]});

const React_logo = createSvgComponent({"meta":{"src":"/_astro/react_logo.BdK5_1xm.svg","width":61,"height":55,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 61.3 54.55"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #4dc8ed;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-1\" d=\"M36.15,27.27c0,3.04-2.46,5.5-5.5,5.5s-5.5-2.46-5.5-5.5,2.46-5.5,5.5-5.5,5.5,2.46,5.5,5.5Z\" />\r\n  <path class=\"cls-1\" d=\"M30.65,14.78C13.72,14.78,0,20.37,0,27.27s13.72,12.5,30.65,12.5,30.65-5.6,30.65-12.5-13.72-12.5-30.65-12.5ZM51.36,33.75c-5.49,2.24-12.84,3.47-20.71,3.47s-15.22-1.23-20.71-3.47c-4.63-1.89-7.39-4.31-7.39-6.48s2.76-4.59,7.39-6.48c5.49-2.24,12.84-3.47,20.71-3.47s15.22,1.23,20.71,3.47c4.63,1.89,7.39,4.31,7.39,6.48s-2.76,4.59-7.39,6.48Z\" />\r\n  <path class=\"cls-1\" d=\"M19.83,21.02c-8.46,14.66-10.48,29.34-4.5,32.79,5.98,3.45,17.68-5.63,26.15-20.29,8.46-14.66,10.48-29.34,4.5-32.79-5.98-3.45-17.68,5.63-26.15,20.29ZM46.61,12.58c-.81,5.87-3.42,12.86-7.35,19.67-3.93,6.81-8.68,12.56-13.36,16.2-3.95,3.06-7.42,4.25-9.3,3.16-1.88-1.08-2.59-4.69-1.91-9.64.81-5.87,3.42-12.86,7.35-19.67,3.93-6.81,8.68-12.56,13.36-16.2,3.95-3.06,7.42-4.25,9.3-3.16,1.88,1.08,2.59,4.69,1.91,9.64Z\" />\r\n  <path class=\"cls-1\" d=\"M15.32.73c-5.98,3.45-3.96,18.13,4.5,32.79,8.46,14.66,20.17,23.74,26.15,20.29,5.98-3.45,3.96-18.13-4.5-32.79C33.01,6.37,21.3-2.72,15.32.73ZM16.6,2.94c1.88-1.08,5.36.1,9.3,3.16,4.68,3.64,9.43,9.39,13.36,16.2,3.93,6.81,6.54,13.8,7.35,19.67.68,4.95-.04,8.55-1.91,9.64-1.88,1.08-5.35-.1-9.3-3.16-4.68-3.64-9.43-9.39-13.36-16.2-3.93-6.81-6.54-13.8-7.35-19.67-.68-4.95.04-8.55,1.91-9.64Z\" />\r\n","styles":[]});

const Nodejs_logo = createSvgComponent({"meta":{"src":"/_astro/nodejs_logo.DgxZDzIg.svg","width":17,"height":20,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 17.4 19.63"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #679e63;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-1\" d=\"M8.71,19.63c-.26,0-.52-.07-.75-.2l-2.4-1.42c-.36-.2-.18-.27-.07-.31.48-.17.58-.2,1.09-.49.05-.03.12-.02.18,0l1.84,1.1c.07.04.16.04.22,0l7.19-4.15c.07-.04.11-.12.11-.19V5.68c0-.08-.04-.16-.11-.2L8.82,1.33c-.07-.04-.15-.04-.22,0L1.41,5.48c-.07.04-.11.12-.11.2v8.3c0,.08.04.15.11.19l1.97,1.14c1.07.53,1.72-.1,1.72-.73V6.39c0-.12.09-.21.21-.21h.91c.11,0,.21.09.21.21v8.19c0,1.43-.78,2.24-2.13,2.24-.42,0-.74,0-1.66-.45l-1.89-1.09c-.47-.27-.75-.77-.75-1.31V5.67c0-.54.29-1.04.75-1.31L7.94.2c.46-.26,1.06-.26,1.51,0l7.19,4.16c.47.27.76.77.76,1.31v8.3c0,.54-.29,1.04-.76,1.31l-7.19,4.15c-.23.13-.49.2-.76.2\" />\r\n  <path class=\"cls-1\" d=\"M10.93,13.92c-3.15,0-3.81-1.44-3.81-2.66,0-.12.09-.21.21-.21h.93c.1,0,.19.07.21.18.14.95.56,1.42,2.46,1.42,1.51,0,2.16-.34,2.16-1.15,0-.46-.18-.81-2.54-1.04-1.97-.19-3.18-.63-3.18-2.2,0-1.45,1.22-2.32,3.27-2.32,2.3,0,3.44.8,3.59,2.52,0,.06-.02.12-.05.16-.04.04-.09.07-.15.07h-.93c-.1,0-.18-.07-.2-.16-.22-1-.77-1.31-2.25-1.31-1.65,0-1.85.58-1.85,1.01,0,.52.23.68,2.46.97,2.21.29,3.26.71,3.26,2.26s-1.31,2.46-3.59,2.46\" />\r\n","styles":[]});

const Kotlin_logo = createSvgComponent({"meta":{"src":"/_astro/kotlin_logo.B33ITrQp.svg","width":500,"height":500,"format":"svg"},"attributes":{"id":"Layer_1","x":"0px","y":"0px","viewBox":"0 0 500 500","style":"enable-background:new 0 0 500 500;","xml:space":"preserve"},"children":"\r\n<style type=\"text/css\">\r\n\t.st0{fill:url(#SVGID_1_);}\r\n</style>\r\n<g id=\"Logotypes\">\r\n\t<g>\r\n\t\t\r\n\t\t\t<linearGradient id=\"SVGID_1_\" gradientUnits=\"userSpaceOnUse\" x1=\"500.0035\" y1=\"579.1058\" x2=\"-9.653803e-02\" y2=\"1079.2058\" gradientTransform=\"matrix(0.9998 0 0 0.9998 9.651873e-02 -578.99)\">\r\n\t\t\t<stop offset=\"3.435144e-03\" style=\"stop-color:#E44857\" />\r\n\t\t\t<stop offset=\"0.4689\" style=\"stop-color:#C711E1\" />\r\n\t\t\t<stop offset=\"1\" style=\"stop-color:#7F52FF\" />\r\n\t\t</linearGradient>\r\n\t\t<polygon class=\"st0\" points=\"500,500 0,500 0,0 500,0 250,250 \t\t\" />\r\n\t</g>\r\n</g>\r\n","styles":["\r\n\t.st0{fill:url(#SVGID_1_);}\r\n"]});

const Flutter_logo = createSvgComponent({"meta":{"src":"/_astro/flutter_logo.DR8CZf0G.svg","width":800,"height":800,"format":"svg"},"attributes":{"width":"800px","height":"800px","viewBox":"-30.5 0 317 317","preserveAspectRatio":"xMidYMid"},"children":"\n    <defs>\n        <linearGradient x1=\"3.9517088%\" y1=\"26.9930287%\" x2=\"75.8970734%\" y2=\"52.9192657%\" id=\"linearGradient-1\">\n            <stop stop-color=\"#000000\" offset=\"0%\">\n\r</stop>\n            <stop stop-color=\"#000000\" stop-opacity=\"0\" offset=\"100%\">\n\r</stop>\n        </linearGradient>\n    </defs>\n\t\t<g>\n\t\t\t\t<polygon fill=\"#47C5FB\" points=\"157.665785 0.000549356223 0.000549356223 157.665785 48.8009614 206.466197 255.267708 0.000549356223\">\n\r</polygon>\n\t\t\t\t<polygon fill=\"#47C5FB\" points=\"156.567183 145.396793 72.1487107 229.815265 121.132608 279.530905 169.842925 230.820587 255.267818 145.396793\">\n\r</polygon>\n\t\t\t\t<polygon fill=\"#00569E\" points=\"121.133047 279.531124 158.214592 316.61267 255.267159 316.61267 169.842266 230.820807\">\n\r</polygon>\n\t\t\t\t<polygon fill=\"#00B5F8\" points=\"71.5995742 230.364072 120.401085 181.562561 169.842046 230.821136 121.132827 279.531454\">\n\r</polygon>\n\t\t\t\t<polygon fill-opacity=\"0.8\" fill=\"url(#linearGradient-1)\" points=\"121.132827 279.531454 161.692896 266.072227 165.721875 234.941308\">\n\r</polygon>\n\t\t</g>\n","styles":[]});

const Django_logo = createSvgComponent({"meta":{"src":"/_astro/django_logo.CiibzVHm.svg","width":470,"height":600,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 470.25 600"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #44b78b;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-1\" d=\"M213.5,0h99.13v454.23c-42.31,8.68-85.38,13.16-128.57,13.37C63,467.48,0,413.4,0,309.55s66.82-165,170.4-165c14.53-.28,29.02,1.4,43.1,5V0h0ZM213.5,228.55c-10.78-3.55-22.08-5.25-33.42-5-50,0-79.08,30.58-79.08,84.15s27.68,80.98,78.45,80.98c11.4,0,22.78-.84,34.05-2.5v-157.63Z\" />\r\n  <path class=\"cls-1\" d=\"M470.12,151.48v227.5c0,78.32-5.88,115.97-23.08,148.45-17.55,33.02-46.26,58.74-81,72.57l-91.95-43.32c33.4-11.44,61.38-34.86,78.53-65.72,14.15-28.03,18.63-60.5,18.63-145.92v-193.55h98.87Z\" />\r\n  <rect class=\"cls-1\" x=\"371.15\" y=\".5\" width=\"99.1\" height=\"100.7\" />\r\n","styles":[]});

const Html5_logo = createSvgComponent({"meta":{"src":"/_astro/html5_logo.DY_JiwhU.svg","width":56,"height":63,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 55.61 63.07"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #fff;\r\n      }\r\n      .cls-2 {\r\n        fill: #e44f26;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <polygon class=\"cls-2\" points=\"27.77 63.07 5.06 56.76 0 0 55.61 0 50.54 56.75 27.77 63.07\" />\r\n  <polygon class=\"cls-1\" points=\"27.82 18.56 44.62 18.56 45.24 11.6 27.82 11.6 27.8 11.6 10.37 11.6 12.25 32.66 27.8 32.66 27.82 32.66 36.37 32.66 35.56 41.68 27.8 43.78 27.8 43.78 27.79 43.78 20.04 41.69 19.55 36.14 12.56 36.14 13.53 47.07 27.79 51.03 27.82 51.02 27.82 51.01 42.07 47.07 43.98 25.69 27.82 25.69 27.8 25.69 18.61 25.69 17.98 18.56 27.8 18.56 27.82 18.56\" />\r\n","styles":[]});

const Css3_logo = createSvgComponent({"meta":{"src":"/_astro/css3_logo.Cx6SqT1d.svg","width":44,"height":50,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 43.65 49.5"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #fff;\r\n      }\r\n      .cls-2 {\r\n        fill: #0f75b8;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <polygon class=\"cls-2\" points=\"21.8 49.5 3.97 44.55 0 0 43.65 0 39.67 44.55 21.8 49.5\" />\r\n  <polygon class=\"cls-1\" points=\"35.51 9.18 21.84 9.18 21.82 9.18 8.14 9.18 8.27 10.65 8.63 14.64 21.82 14.64 21.84 14.64 22.47 14.64 9.12 20.24 9.61 25.7 21.82 25.7 21.84 25.7 28.55 25.7 27.91 32.79 21.82 34.43 21.82 34.44 15.74 32.79 15.35 28.44 12.39 28.44 9.86 28.44 10.63 37.01 21.82 40.12 21.82 40.12 21.82 40.12 33.02 37.01 34.52 20.24 22.16 20.24 35.02 14.64 35.51 9.18\" />\r\n","styles":[]});

const Tailwind_logo = createSvgComponent({"meta":{"src":"/_astro/tailwind_logo.Da38NpG4.svg","width":2500,"height":1499,"format":"svg"},"attributes":{"height":"1499","viewBox":".15 .13 799.7 479.69","width":"2500"},"children":"<path d=\"m400 .13c-106.63 0-173.27 53.3-199.93 159.89 39.99-53.3 86.64-73.28 139.95-59.96 30.42 7.6 52.16 29.67 76.23 54.09 39.2 39.78 84.57 85.82 183.68 85.82 106.62 0 173.27-53.3 199.92-159.9-39.98 53.3-86.63 73.29-139.95 59.97-30.41-7.6-52.15-29.67-76.22-54.09-39.2-39.78-84.58-85.82-183.68-85.82zm-199.93 239.84c-106.62 0-173.27 53.3-199.92 159.9 39.98-53.3 86.63-73.29 139.95-59.96 30.41 7.61 52.15 29.67 76.22 54.08 39.2 39.78 84.58 85.83 183.68 85.83 106.63 0 173.27-53.3 199.93-159.9-39.99 53.3-86.64 73.29-139.95 59.96-30.42-7.59-52.16-29.67-76.23-54.08-39.2-39.78-84.57-85.83-183.68-85.83z\" fill=\"#06b6d4\" />","styles":[]});

const Bootstrap_logo = createSvgComponent({"meta":{"src":"/_astro/bootstrap_logo.BgVJKO45.svg","width":512,"height":408,"format":"svg"},"attributes":{"width":"512","height":"408"},"children":"<defs><linearGradient id=\"bs-logo-a\" x1=\"76.079\" x2=\"523.48\" y1=\"10.798\" y2=\"365.945\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#9013fe\" /><stop offset=\"1\" stop-color=\"#6610f2\" /></linearGradient><linearGradient id=\"bs-logo-b\" x1=\"193.508\" x2=\"293.514\" y1=\"109.74\" y2=\"278.872\" gradientUnits=\"userSpaceOnUse\"><stop stop-color=\"#fff\" /><stop offset=\"1\" stop-color=\"#f1e5fc\" /></linearGradient><filter xmlns=\"http://www.w3.org/2000/svg\" id=\"bs-logo-c\" width=\"197\" height=\"249\" x=\"161.901\" y=\"83.457\" color-interpolation-filters=\"sRGB\" filterUnits=\"userSpaceOnUse\"><feFlood flood-opacity=\"0\" result=\"BackgroundImageFix\" /><feColorMatrix in=\"SourceAlpha\" values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0\" /><feOffset dy=\"4\" /><feGaussianBlur stdDeviation=\"8\" /><feColorMatrix values=\"0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0\" /><feBlend in2=\"BackgroundImageFix\" result=\"effect1_dropShadow\" /><feBlend in=\"SourceGraphic\" in2=\"effect1_dropShadow\" result=\"shape\" /></filter></defs><path fill=\"url(#bs-logo-a)\" d=\"M56.481 53.32C55.515 25.58 77.128 0 106.342 0h299.353c29.214 0 50.827 25.58 49.861 53.32-.928 26.647.277 61.165 8.964 89.31 8.715 28.232 23.411 46.077 47.48 48.37v26c-24.069 2.293-38.765 20.138-47.48 48.37-8.687 28.145-9.892 62.663-8.964 89.311.966 27.739-20.647 53.319-49.861 53.319H106.342c-29.214 0-50.827-25.58-49.86-53.319.927-26.648-.278-61.166-8.966-89.311C38.802 237.138 24.07 219.293 0 217v-26c24.069-2.293 38.802-20.138 47.516-48.37 8.688-28.145 9.893-62.663 8.965-89.31z\" /><path fill=\"url(#bs-logo-b)\" filter=\"url(#bs-logo-c)\" stroke=\"#fff\" d=\"M267.103 312.457c47.297 0 75.798-23.158 75.798-61.355 0-28.873-20.336-49.776-50.532-53.085v-1.203c22.185-3.609 39.594-24.211 39.594-47.219 0-32.783-25.882-54.138-65.322-54.138h-88.74v217h89.202zm-54.692-189.48h45.911c24.958 0 39.131 11.128 39.131 31.279 0 21.505-16.484 33.535-46.372 33.535h-38.67v-64.814zm0 161.961v-71.431h45.602c32.661 0 49.608 12.03 49.608 35.49 0 23.459-16.484 35.941-47.605 35.941h-47.605z\" />","styles":[]});

const Supabase_logo = createSvgComponent({"meta":{"src":"/_astro/supabase_logo.CSVTUqck.svg","width":109,"height":113,"format":"svg"},"attributes":{"width":"109","height":"113","viewBox":"0 0 109 113","fill":"none"},"children":"\r\n<path d=\"M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z\" fill=\"url(#paint0_linear)\" />\r\n<path d=\"M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z\" fill=\"url(#paint1_linear)\" fill-opacity=\"0.2\" />\r\n<path d=\"M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z\" fill=\"#3ECF8E\" />\r\n<defs>\r\n<linearGradient id=\"paint0_linear\" x1=\"53.9738\" y1=\"54.974\" x2=\"94.1635\" y2=\"71.8295\" gradientUnits=\"userSpaceOnUse\">\r\n<stop stop-color=\"#249361\" />\r\n<stop offset=\"1\" stop-color=\"#3ECF8E\" />\r\n</linearGradient>\r\n<linearGradient id=\"paint1_linear\" x1=\"36.1558\" y1=\"30.578\" x2=\"54.4844\" y2=\"65.0806\" gradientUnits=\"userSpaceOnUse\">\r\n<stop />\r\n<stop offset=\"1\" stop-opacity=\"0\" />\r\n</linearGradient>\r\n</defs>\r\n","styles":[]});

const Firebase_logo = createSvgComponent({"meta":{"src":"/_astro/firebase_logo.BURJP9xB.svg","width":459,"height":576,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 458.68 576.1"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #ff9100;\r\n      }\r\n      .cls-2 {\r\n        fill: #ffc400;\r\n      }\r\n      .cls-3 {\r\n        fill: #dd2c00;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-1\" d=\"M143.66,559.54c24.11,9.7,50.26,15.46,77.72,16.42,37.16,1.3,72.5-6.39,104.09-20.98-37.88-14.88-72.19-36.65-101.48-63.71-18.98,30.39-47.06,54.4-80.33,68.28Z\" />\r\n  <path class=\"cls-2\" d=\"M223.99,491.28c-66.84-61.82-107.39-151.3-103.97-249.44.11-3.19.28-6.37.48-9.56-11.97-3.1-24.47-4.99-37.33-5.43-18.41-.64-36.24,1.64-53.07,6.38C12.25,264.48,1.48,300.35.14,338.76c-3.46,99.14,56.53,185.76,143.51,220.79,33.28-13.88,61.35-37.86,80.33-68.28Z\" />\r\n  <path class=\"cls-1\" d=\"M223.99,491.27c15.54-24.87,24.96-54.03,26.06-85.44,2.89-82.63-52.67-153.72-129.55-173.55-.2,3.18-.36,6.37-.48,9.56-3.43,98.14,37.12,187.62,103.97,249.44Z\" />\r\n  <path class=\"cls-3\" d=\"M241.45,0c-43.79,35.08-78.37,81.34-99.29,134.62-11.98,30.52-19.5,63.31-21.7,97.67,76.88,19.84,132.44,90.92,129.55,173.55-1.1,31.41-10.55,60.54-26.06,85.44,29.28,27.09,63.59,48.83,101.48,63.71,76.04-35.15,129.99-110.79,133.12-200.25,2.02-57.96-20.25-109.62-51.71-153.23C373.6,155.41,241.45,0,241.45,0Z\" />\r\n","styles":[]});

const Mongodb_logo = createSvgComponent({"meta":{"src":"/_astro/mongodb_logo.BTr7JL8c.svg","width":912,"height":2030,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 911.94 2030.29"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #c2bfbf;\r\n      }\r\n\r\n      .cls-2 {\r\n        fill: #599636;\r\n      }\r\n\r\n      .cls-3 {\r\n        fill: #6cac48;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path class=\"cls-2\" d=\"M449.62,5.55l54.18,101.76c12.18,18.78,25.38,35.4,40.92,50.88,45.57,45,88.05,93.03,127.14,143.76,91.8,120.54,153.72,254.4,197.94,399.18,26.52,88.44,40.92,179.16,42,270.9,4.44,274.26-89.58,509.75-279.14,705.47-30.83,31.04-64.15,59.51-99.6,85.14-18.78,0-27.66-14.4-35.4-27.66-14.09-24.59-23.48-51.59-27.66-79.62-6.66-33.18-11.04-66.36-8.88-100.62v-15.48c-1.52-3.3-18.08-1525.9-11.48-1533.71h0Z\" />\r\n  <path class=\"cls-3\" d=\"M449.62,2.18c-2.22-4.44-4.44-1.08-6.66,1.08,1.08,22.2-6.66,42-18.78,60.9-13.32,18.78-30.96,33.18-48.66,48.66-98.33,85.14-175.73,187.98-237.72,303C55.33,570.62,12.82,736.52.77,911.18c-5.52,63,19.92,285.3,39.78,349.44,54.18,170.28,151.5,312.96,277.56,436.8,30.96,29.82,64.08,57.48,98.33,84.06,9.96,0,11.04-8.88,13.32-15.48,4.37-14.12,7.7-28.54,9.96-43.14l22.2-165.84L449.62,2.18Z\" />\r\n  <path class=\"cls-1\" d=\"M503.8,1830c2.22-25.38,14.4-46.44,27.66-67.44-13.32-5.52-23.22-16.49-30.96-28.74-6.67-11.59-12.2-23.81-16.49-36.48-15.48-46.44-18.78-95.16-23.22-142.62v-28.74c-5.52,4.44-6.66,42-6.66,47.58-3.23,50.16-9.88,100.03-19.92,149.28-3.3,19.92-5.52,39.78-17.76,57.48,0,2.22,0,4.44,1.08,7.74,19.92,58.62,25.38,118.32,28.74,179.16v22.2c0,26.52-1.08,20.94,20.94,29.82,8.88,3.3,18.78,4.44,27.66,11.04,6.66,0,7.74-5.52,7.74-9.96l-3.3-36.48v-101.76c-1.08-17.76,2.22-35.4,4.44-52.02l.06-.06Z\" />\r\n","styles":[]});

const Figma_logo = createSvgComponent({"meta":{"src":"/_astro/figma_logo.BRPtR63_.svg","width":25,"height":38,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 25.1 37.65"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #8162aa;\r\n      }\r\n      .cls-2 {\r\n        fill: #f37264;\r\n      }\r\n      .cls-3 {\r\n        fill: #f05023;\r\n      }\r\n      .cls-4 {\r\n        fill: #48ba7f;\r\n      }\r\n      .cls-5 {\r\n        fill: #47b8e9;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <path id=\"path0_fill\" data-name=\"path0 fill\" class=\"cls-4\" d=\"M6.27,37.65c3.46,0,6.27-2.81,6.27-6.27v-6.27h-6.27c-3.46,0-6.27,2.81-6.27,6.27s2.81,6.27,6.27,6.27Z\" />\r\n  <path id=\"path1_fill\" data-name=\"path1 fill\" class=\"cls-1\" d=\"M0,18.82c0-3.46,2.81-6.27,6.27-6.27h6.27v12.55h-6.27c-3.46,0-6.27-2.81-6.27-6.27Z\" />\r\n  <path id=\"path1_fill-2\" data-name=\"path1 fill\" class=\"cls-3\" d=\"M0,6.27C0,2.81,2.81,0,6.27,0h6.27v12.55h-6.27c-3.46,0-6.27-2.81-6.27-6.27Z\" />\r\n  <path id=\"path2_fill\" data-name=\"path2 fill\" class=\"cls-2\" d=\"M12.55,0h6.27c3.46,0,6.27,2.81,6.27,6.27s-2.81,6.27-6.27,6.27h-6.27V0Z\" />\r\n  <path id=\"path3_fill\" data-name=\"path3 fill\" class=\"cls-5\" d=\"M25.1,18.82c0,3.46-2.81,6.27-6.27,6.27s-6.27-2.81-6.27-6.27,2.81-6.27,6.27-6.27,6.27,2.81,6.27,6.27Z\" />\r\n","styles":[]});

const Mockflow_logo = createSvgComponent({"meta":{"src":"/_astro/mockflow_logo.B0PgHFYs.svg","width":800,"height":800,"format":"svg"},"attributes":{"width":"800px","height":"800px","viewBox":"0 -19 256 256","preserveAspectRatio":"xMidYMid"},"children":"\r\n    <defs>\r\n        <linearGradient x1=\"100%\" y1=\"50%\" x2=\"8.18615787%\" y2=\"50%\" id=\"linearGradient-1\">\r\n            <stop stop-color=\"#1A9BE2\" offset=\"0%\">\r\n</stop>\r\n            <stop stop-color=\"#1A99E2\" offset=\"43.4496941%\">\r\n</stop>\r\n            <stop stop-color=\"#1A8CE2\" offset=\"100%\">\r\n</stop>\r\n        </linearGradient>\r\n        <linearGradient x1=\"100%\" y1=\"50%\" x2=\"0%\" y2=\"50%\" id=\"linearGradient-2\">\r\n            <stop stop-color=\"#3AB7F3\" offset=\"0%\">\r\n</stop>\r\n            <stop stop-color=\"#2999E9\" offset=\"30.7463681%\">\r\n</stop>\r\n            <stop stop-color=\"#1B80E2\" offset=\"100%\">\r\n</stop>\r\n        </linearGradient>\r\n        <linearGradient x1=\"100%\" y1=\"50%\" x2=\"0%\" y2=\"50%\" id=\"linearGradient-3\">\r\n            <stop stop-color=\"#37A7E7\" offset=\"0%\">\r\n</stop>\r\n            <stop stop-color=\"#2991E5\" offset=\"43.0135262%\">\r\n</stop>\r\n            <stop stop-color=\"#1B7CE3\" offset=\"100%\">\r\n</stop>\r\n        </linearGradient>\r\n        <linearGradient x1=\"100%\" y1=\"50%\" x2=\"0%\" y2=\"50%\" id=\"linearGradient-4\">\r\n            <stop stop-color=\"#1A8FE2\" offset=\"0%\">\r\n</stop>\r\n            <stop stop-color=\"#1A9BE2\" offset=\"100%\">\r\n</stop>\r\n        </linearGradient>\r\n    </defs>\r\n    <g>\r\n        <polygon fill=\"#1A8CE2\" points=\"150.377824 0 75.1885118 81.5672534 0.000199998169 0 0.000199998169 217.514009 75.1885118 135.945756 150.377824 217.514009 150.377824 151.88561 220.288184 100.252082 150.377824 100.252082 150.377824 47.8935616 226.802124 47.8935616 255.996857 0\">\r\n</polygon>\r\n        <polygon fill=\"url(#linearGradient-1)\" points=\"150.377824 0 50.1257412 108.757005 150.377824 217.514009\">\r\n</polygon>\r\n        <polygon fill=\"url(#linearGradient-2)\" points=\"220.287984 100.251782 150.377624 100.251782 150.377624 151.88531\">\r\n</polygon>\r\n        <polygon fill=\"url(#linearGradient-3)\" points=\"150.377824 0 150.377824 47.8935616 226.802124 47.8935616 255.996857 0\">\r\n</polygon>\r\n        <polygon fill=\"url(#linearGradient-4)\" points=\"0 0 0 217.514009 100.252082 108.757005\">\r\n</polygon>\r\n    </g>\r\n","styles":[]});

const Git_logo = createSvgComponent({"meta":{"src":"/_astro/git_logo.DnS9BrEb.svg","width":800,"height":800,"format":"svg"},"attributes":{"width":"800px","height":"800px","viewBox":"0 0 256 256","preserveAspectRatio":"xMinYMin meet"},"children":"<path d=\"M251.172 116.594L139.4 4.828c-6.433-6.437-16.873-6.437-23.314 0l-23.21 23.21 29.443 29.443c6.842-2.312 14.688-.761 20.142 4.693 5.48 5.489 7.02 13.402 4.652 20.266l28.375 28.376c6.865-2.365 14.786-.835 20.269 4.657 7.663 7.66 7.663 20.075 0 27.74-7.665 7.666-20.08 7.666-27.749 0-5.764-5.77-7.188-14.235-4.27-21.336l-26.462-26.462-.003 69.637a19.82 19.82 0 0 1 5.188 3.71c7.663 7.66 7.663 20.076 0 27.747-7.665 7.662-20.086 7.662-27.74 0-7.663-7.671-7.663-20.086 0-27.746a19.654 19.654 0 0 1 6.421-4.281V94.196a19.378 19.378 0 0 1-6.421-4.281c-5.806-5.798-7.202-14.317-4.227-21.446L81.47 39.442l-76.64 76.635c-6.44 6.443-6.44 16.884 0 23.322l111.774 111.768c6.435 6.438 16.873 6.438 23.316 0l111.251-111.249c6.438-6.44 6.438-16.887 0-23.324\" fill=\"#DE4C36\" />","styles":[]});

const Js_logo = createSvgComponent({"meta":{"src":"/_astro/js_logo.D9SrHxYA.svg","width":57,"height":57,"format":"svg"},"attributes":{"id":"Layer_1","data-name":"Layer 1","viewBox":"0 0 57.27 57.27"},"children":"\r\n  <defs>\r\n    <style>\r\n      .cls-1 {\r\n        fill: #010101;\r\n      }\r\n      .cls-2 {\r\n        fill: #f6e014;\r\n      }\r\n    </style>\r\n  </defs>\r\n  <rect class=\"cls-2\" width=\"57.27\" height=\"57.27\" />\r\n  <g>\r\n    <path class=\"cls-1\" d=\"M14.83,47.91l4.37-2.64c.84,1.49,1.61,2.76,3.45,2.76s2.87-.69,2.87-3.37v-18.23h5.36v18.3c0,5.55-3.25,8.08-8,8.08-4.29,0-6.78-2.22-8.04-4.9Z\" />\r\n    <path class=\"cls-1\" d=\"M33.78,47.33l4.37-2.53c1.15,1.88,2.64,3.25,5.28,3.25,2.22,0,3.64-1.11,3.64-2.64,0-1.84-1.45-2.49-3.91-3.56l-1.34-.57c-3.87-1.65-6.43-3.71-6.43-8.08,0-4.02,3.06-7.08,7.85-7.08,3.41,0,5.86,1.19,7.62,4.29l-4.17,2.68c-.92-1.65-1.91-2.3-3.45-2.3s-2.57,1-2.57,2.3c0,1.61,1,2.26,3.29,3.25l1.34.57c4.56,1.95,7.12,3.94,7.12,8.42,0,4.82-3.79,7.47-8.88,7.47s-8.19-2.37-9.76-5.48Z\" />\r\n  </g>\r\n","styles":[]});

const $$Skills = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Skills;
  const skills = [
    { name: "C++", icon: Cpp_logo },
    { name: "C#", icon: Csharp },
    { name: "Python", icon: Python },
    { name: "JavaScript", icon: Js_logo },
    { name: "PHP", icon: Php_logo },
    { name: "Dart", icon: Dart_logo },
    { name: "Astro", icon: Astro_logo },
    { name: "React", icon: React_logo },
    { name: "Node.js", icon: Nodejs_logo },
    { name: "Electron", icon: Electron_logo },
    { name: "Kotlin", icon: Kotlin_logo },
    { name: "Java", icon: Java_logo },
    { name: "Flutter", icon: Flutter_logo },
    { name: "Django", icon: Django_logo },
    { name: "HTML", icon: Html5_logo },
    { name: "CSS", icon: Css3_logo },
    { name: "Tailwind", icon: Tailwind_logo },
    { name: "Bootstrap", icon: Bootstrap_logo },
    { name: "SQL", icon: Sql_logo },
    { name: "Supabase", icon: Supabase_logo },
    { name: "Firebase", icon: Firebase_logo },
    { name: "MongoDB", icon: Mongodb_logo },
    { name: "Figma", icon: Figma_logo },
    { name: "MockFlow", icon: Mockflow_logo },
    { name: "Git", icon: Git_logo },
    { name: "Docker", icon: Docker_logo },
    { name: "Notion", icon: Notion_logo },
    { name: "Illustrator", icon: Ilustrator_logo },
    { name: "Photoshop", icon: Photoshop_logo },
    { name: "XD", icon: Xd_logo }
  ];
  return renderTemplate`${renderComponent($$result, "Section", $$Section, { "id": "skills", "mt": "true", "mb": "true", "data-astro-cid-gvf553jq": true }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TitleSection", $$TitleSection, { "imageSrc": Portfolio_icon$1, "title": "Habilidades", "data-astro-cid-gvf553jq": true })} ${maybeRenderHead()}<div class="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 p-2 sm:p-4" data-astro-cid-gvf553jq> ${skills.map((skill) => renderTemplate`<div class="group perspective-1000 cursor-pointer h-24 w-24 sm:h-28 sm:w-28 mx-auto" data-astro-cid-gvf553jq> <div class="relative w-full h-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180" data-astro-cid-gvf553jq> <!-- Front --> <div class="absolute inset-0 bg-[#003b41] rounded-2xl p-4 flex items-center justify-center backface-hidden shadow-lg border border-white/5 group-hover:border-accent/50 transition-colors z-10" data-astro-cid-gvf553jq> ${renderComponent($$result2, "skill.icon", skill.icon, { "class": "w-10 h-10 sm:w-14 sm:h-14", "data-astro-cid-gvf553jq": true })} </div> <!-- Back --> <div class="absolute inset-0 bg-bg-card rounded-2xl p-2 sm:p-4 flex items-center justify-center rotate-y-180 backface-hidden shadow-lg border border-accent/30 z-0" data-astro-cid-gvf553jq> ${renderComponent($$result2, "Text", $$Text, { "text": skill.name, "type": "mini", "extraClass": "!text-center font-bold !text-xs sm:!text-sm", "data-astro-cid-gvf553jq": true })} </div> </div> </div>`)} </div> ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/sections/skills.astro", void 0);

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "adardev | Portfolio" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "Hero", $$Hero, {})} ${renderComponent($$result2, "About", $$About, {})} ${renderComponent($$result2, "Experience", $$Experience, {})} ${renderComponent($$result2, "Projects", $$Projects, {})} ${renderComponent($$result2, "Skills", $$Skills, {})} ` })}`;
}, "C:/Users/adaredu/Documents/densora/adardev/src/pages/index.astro", void 0);

const $$file = "C:/Users/adaredu/Documents/densora/adardev/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

const index___astro = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  page
}, Symbol.toStringTag, { value: 'Module' }));

export { baseService as b, index___astro as i, parseQuality as p };
