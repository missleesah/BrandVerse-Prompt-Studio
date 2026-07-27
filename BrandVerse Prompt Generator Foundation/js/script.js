"use strict";

/* ==========================================================================
   BRANDVERSE PROMPT STUDIO
   Complete script.js
   ========================================================================== */

(() => {
  const STORAGE_KEY = "brandversePromptHistory";
  const MAX_HISTORY_ITEMS = 12;
  const TOAST_DURATION = 3600;

  const CHARACTER_CREATION_TYPES = new Set([
    "Character",
    "Fashion Doll",
    "Mascot",
    "Plush Character",
    "Collectible Figure",
    "Beauty Campaign",
    "Luxury Editorial",
    "Advertising Scene",
    "Character and Product Scene",
    "Complete Scene"
  ]);

  const PRODUCT_CREATION_TYPES = new Set([
    "Product",
    "Product Packaging",
    "Product Display",
    "Beauty Campaign",
    "Luxury Editorial",
    "Advertising Scene",
    "Product Collection",
    "Character and Product Scene",
    "Complete Scene"
  ]);

  const PRODUCT_ONLY_TYPES = new Set([
    "Product",
    "Product Packaging",
    "Product Display",
    "Product Collection"
  ]);

  const ENVIRONMENT_ONLY_TYPES = new Set([
    "Environment",
    "Room or Interior",
    "Boutique or Retail Space",
    "Fantasy World"
  ]);

  const PROTECTED_TEXT_KEYS = new Set([
    "inspirationName",
    "customConcept",
    "referenceDirection",
    "characterNotes",
    "productLabelText",
    "productNotes",
    "customColors",
    "customExclusions",
    "mustInclude",
    "mustAvoid",
    "additionalDirection"
  ]);

  const RANDOMIZE_EXCLUDED_KEYS = new Set([
    ...PROTECTED_TEXT_KEYS,
    "targetAudience"
  ]);

  const categoryDefaults = {
    inspiration: {
      inspirationCategory: "Food & Beverage",
      inspirationSource: "Custom Brand or Concept",
      inspirationName: "",
      customConcept: "",
      influenceStrength: "Balanced",
      referenceDirection: ""
    },
    creationType: {
      creationType: "Complete Scene",
      subjectCount: "One",
      targetAudience: "General Audience",
      presentationPurpose: "Commercial Artwork"
    },
    character: {
      characterType: "Adult Character",
      genderPresentation: "User Choice",
      ageGroup: "Adult",
      skinTone: "Custom or Unspecified",
      bodyType: "Custom or Unspecified",
      hairStyle: "Custom or Unspecified",
      hairColor: "Custom or Unspecified",
      facialDetails: [],
      expression: "Confident",
      outfitDirection: "Coordinated Brand-Inspired Fashion",
      accessories: [],
      characterProps: [],
      characterNotes: ""
    },
    product: {
      productCategory: "General Consumer Product",
      productForm: "Hero Product",
      packagingStyle: "Premium Custom Packaging",
      productMaterial: [],
      productCondition: "New and Pristine",
      productPlacement: "Foreground Hero Position",
      productLabelText: "",
      productNotes: ""
    },
    style: {
      styleFamily: "3D and Digital Art",
      visualStyle: "Glossy 3D Cartoon Realism",
      realismLevel: "Stylized Realism",
      visualFinish: ["Commercial Polish"],
      lineTreatment: "Clean Defined Edges",
      detailLevel: "Highly Detailed"
    },
    environment: {
      environmentType: "Studio Scene",
      setting: "Clean Creative Studio",
      backgroundTreatment: "Clean Neutral Background",
      environmentProps: [],
      atmosphere: "Polished and Inviting",
      sceneDensity: "Balanced"
    },
    colorLighting: {
      colorStrategy: "Brand-Coordinated Palette",
      mainPalette: "Custom Brand Colors",
      customColors: "",
      lightingStyle: "Soft Studio Lighting",
      lightQuality: "Diffused",
      mood: ["Polished"]
    },
    composition: {
      poseArrangement: "Confident Hero Pose",
      cameraView: "Front View",
      framing: "Full Subject",
      perspective: "Eye Level",
      compositionStyle: "Centered Balanced Composition",
      focalEmphasis: "Main Subject",
      aspectRatio: "1:1 Square"
    },
    finish: {
      textureDirection: ["Smooth Commercial Finish"],
      renderQuality: "Premium Commercial Quality",
      textRequirement: "No Text Required",
      anatomyGuidance: "Accurate Natural Anatomy",
      productVisibility: "Fully Visible",
      negativeGuidance: ["Standard Quality Protection"],
      customExclusions: ""
    },
    customGuidance: {
      mustInclude: "",
      mustAvoid: "",
      additionalDirection: ""
    }
  };

  const presets = {
    "preset-commercial-character": {
      creationType: "Character",
      characterType: "Adult Character",
      outfitDirection: "Coordinated Brand-Inspired Fashion",
      visualStyle: "Glossy 3D Cartoon Realism",
      realismLevel: "Stylized Realism",
      environmentType: "Studio Scene",
      colorStrategy: "Brand-Coordinated Palette",
      lightingStyle: "Soft Studio Lighting",
      poseArrangement: "Confident Hero Pose",
      framing: "Full Body",
      renderQuality: "Premium Commercial Quality"
    },

    "preset-product-campaign": {
      creationType: "Product",
      productForm: "Hero Product",
      packagingStyle: "Premium Custom Packaging",
      productPlacement: "Foreground Hero Position",
      visualStyle: "Photorealistic Commercial Photography",
      environmentType: "Product Studio",
      backgroundTreatment: "Product-Coordinated Background",
      lightingStyle: "Product Spotlight",
      compositionStyle: "Product Hero Composition",
      renderQuality: "Premium Commercial Quality",
      anatomyGuidance: "Product Only, No Anatomy"
    },

    "preset-fashion-doll": {
      creationType: "Fashion Doll",
      characterType: "Fashion Doll",
      bodyType: "Exaggerated Doll Proportions",
      outfitDirection: "Coordinated Brand-Inspired Fashion",
      visualStyle: "Fashion Doll Illustration",
      realismLevel: "Stylized Realism",
      atmosphere: "Glamorous",
      lightingStyle: "Beauty Lighting",
      framing: "Full Body",
      compositionStyle: "Centered Balanced Composition",
      renderQuality: "Collectible Product Render Quality",
      anatomyGuidance: "Accurate Doll Anatomy"
    },

    "preset-fantasy-world": {
      creationType: "Complete Scene",
      environmentType: "Fantasy World",
      visualStyle: "Fantasy Illustration",
      backgroundTreatment: "Detailed Environment",
      colorStrategy: "Brand-Coordinated Palette",
      lightingStyle: "Dreamy Glow",
      atmosphere: "Whimsical",
      framing: "Wide Environmental Shot",
      compositionStyle: "Layered Depth Composition",
      renderQuality: "Premium Commercial Quality"
    },

    "preset-clean-product": {
      creationType: "Product Display",
      productForm: "Product and Packaging",
      visualStyle: "Minimal Product Photography",
      setting: "White Photography Studio",
      backgroundTreatment: "White Background",
      lightingStyle: "Even Commercial Lighting",
      productPlacement: "Centered Product Display",
      framing: "Isolated Product",
      compositionStyle: "Minimal Composition",
      renderQuality: "Advertising Campaign Quality",
      anatomyGuidance: "Product Only, No Anatomy"
    }
  };

  const state = {
    activeStudio: "inspiration",
    lockedCategories: new Set(),
    generatedPrompt: "",
    generatedSnapshot: "",
    isStale: false,
    history: [],
    modalAction: null,
    modalPayload: null,
    modalTrigger: null
  };

  const dom = {};

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */

  document.addEventListener("DOMContentLoaded", initializeApplication);

  function initializeApplication() {
    cacheDom();
    loadHistory();
    bindEvents();
    synchronizeChipClasses();
    updateConditionalCategories();
    renderHistory();
    updateCopyButton();
    updatePromptState("empty");
    updateQualityState("empty");
  }

  function cacheDom() {
    dom.tabs = Array.from(document.querySelectorAll(".studio-tab"));
    dom.panels = Array.from(document.querySelectorAll(".studio-panel"));
    dom.categoryCards = Array.from(document.querySelectorAll(".category-card"));
    dom.formControls = Array.from(
      document.querySelectorAll(
        "input[data-key], select[data-key], textarea[data-key]"
      )
    );
    dom.chipFields = Array.from(document.querySelectorAll(".chip-field[data-key]"));
    dom.chips = Array.from(document.querySelectorAll(".chip"));
    dom.generateButton = document.getElementById("button-generate-prompt");
    dom.randomizeAllButton = document.getElementById("button-randomize-all");
    dom.clearAllButton = document.getElementById("button-clear-all");
    dom.copyButton = document.getElementById("button-copy-prompt");
    dom.promptOutput = document.getElementById("prompt-output");
    dom.qualityResult = document.getElementById("quality-result");
    dom.historyContainer = document.getElementById("prompt-history");
    dom.validationSummary = document.getElementById("validation-summary");
    dom.validationList = document.getElementById("validation-summary-list");
    dom.updateNeededMessage = document.getElementById("update-needed-message");
    dom.toastRegion = document.getElementById("toast-region");
    dom.modal = document.getElementById("confirmation-modal");
    dom.modalTitle = document.getElementById("confirmation-modal-title");
    dom.modalMessage = document.getElementById("confirmation-modal-message");
    dom.modalConfirmButton = document.getElementById("button-modal-confirm");
    dom.modalCancelButton = document.getElementById("button-modal-cancel");
    dom.creationType = document.getElementById("input-creation-type");
    dom.textRequirement = document.getElementById("input-text-requirement");
    dom.productLabelText = document.getElementById("input-product-label-text");
  }

  function bindEvents() {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("input", handleControlChange);
    document.addEventListener("change", handleControlChange);
    document.addEventListener("keydown", handleGlobalKeydown);

    dom.tabs.forEach((tab) => {
      tab.addEventListener("keydown", handleTabKeydown);
    });

    dom.modal.addEventListener("keydown", trapModalFocus);
  }

  /* ==========================================================================
     EVENT ROUTING
     ========================================================================== */

  function handleDocumentClick(event) {
    const tab = event.target.closest(".studio-tab");
    if (tab) {
      activateStudio(tab.dataset.studio, true);
      return;
    }

    const chip = event.target.closest(".chip");
    if (chip) {
      toggleChip(chip);
      return;
    }

    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;

    switch (action) {
      case "apply-preset":
        applyPreset(actionElement.dataset.preset);
        break;

      case "toggle-lock":
        toggleCategoryLock(actionElement.dataset.category, actionElement);
        break;

      case "randomize-category":
        randomizeCategory(actionElement.dataset.category);
        break;

      case "clear-category":
        requestClearCategory(actionElement.dataset.category, actionElement);
        break;

      case "generate":
        generatePrompt();
        break;

      case "randomize-all":
        randomizeAll();
        break;

      case "clear-all":
        openConfirmationModal({
          title: "Clear current project?",
          message:
            "Your selections, locks, generated prompt, and quality result will be reset. Prompt history will remain available.",
          confirmLabel: "Clear All",
          action: "clear-all",
          trigger: actionElement
        });
        break;

      case "copy-prompt":
        copyCurrentPrompt();
        break;

      case "delete-history":
        requestDeleteHistory(actionElement.dataset.historyId, actionElement);
        break;

      case "load-history":
        loadHistoryPrompt(actionElement.dataset.historyId);
        break;

      case "copy-history":
        copyHistoryPrompt(actionElement.dataset.historyId);
        break;

      case "cancel-modal":
        closeConfirmationModal();
        break;

      case "confirm-modal":
        executeModalAction();
        break;

      default:
        break;
    }
  }

  function handleControlChange(event) {
    const target = event.target;

    if (
      !target.matches("input[data-key], select[data-key], textarea[data-key]")
    ) {
      return;
    }

    clearControlError(target);

    if (target === dom.creationType) {
      updateConditionalCategories();
      synchronizeAnatomyForCreationType();
    }

    if (target === dom.textRequirement) {
      synchronizeTextRequirement();
    }

    markPromptStale();
  }

  function handleGlobalKeydown(event) {
    if (event.key === "Escape" && !dom.modal.hidden) {
      closeConfirmationModal();
    }
  }

  function handleTabKeydown(event) {
    const currentIndex = dom.tabs.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % dom.tabs.length;
        break;

      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + dom.tabs.length) % dom.tabs.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = dom.tabs.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();
    const nextTab = dom.tabs[nextIndex];
    nextTab.focus();
    activateStudio(nextTab.dataset.studio, false);
  }

  /* ==========================================================================
     STUDIO NAVIGATION
     ========================================================================== */

  function activateStudio(studioName, focusPanel = false) {
    state.activeStudio = studioName;

    dom.tabs.forEach((tab) => {
      const isActive = tab.dataset.studio === studioName;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    dom.panels.forEach((panel) => {
      const isActive = panel.dataset.studioPanel === studioName;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });

    if (focusPanel) {
      const panel = document.querySelector(
        `[data-studio-panel="${escapeSelectorValue(studioName)}"]`
      );

      panel?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  /* ==========================================================================
     CHIP GROUPS
     ========================================================================== */

  function toggleChip(chip) {
    const field = chip.closest(".chip-field");
    if (!field || isElementLocked(field) || chip.disabled) {
      return;
    }

    const value = chip.dataset.value;
    const maxSelections = Number(field.dataset.maxSelections || 1);
    const selectedChips = getSelectedChips(field);
    const isSelected = chip.getAttribute("aria-pressed") === "true";

    if (isSelected) {
      setChipSelected(chip, false);
      markPromptStale();
      return;
    }

    if (value === "None") {
      selectedChips.forEach((selectedChip) => {
        setChipSelected(selectedChip, false);
      });
      setChipSelected(chip, true);
      markPromptStale();
      return;
    }

    const noneChip = field.querySelector('.chip[data-value="None"]');
    if (noneChip) {
      setChipSelected(noneChip, false);
    }

    const activeNonNoneCount = getSelectedChips(field).filter(
      (selectedChip) => selectedChip.dataset.value !== "None"
    ).length;

    if (activeNonNoneCount >= maxSelections) {
      showToast(
        `You may select up to ${maxSelections} option${
          maxSelections === 1 ? "" : "s"
        } in this group.`,
        "warning"
      );
      return;
    }

    setChipSelected(chip, true);
    markPromptStale();
  }

  function setChipSelected(chip, selected) {
    chip.classList.toggle("selected", selected);
    chip.setAttribute("aria-pressed", String(selected));
  }

  function getSelectedChips(field) {
    return Array.from(
      field.querySelectorAll('.chip[aria-pressed="true"]')
    );
  }

  function getChipValues(field) {
    return getSelectedChips(field)
      .map((chip) => chip.dataset.value)
      .filter((value) => value && value !== "None");
  }

  function setChipValues(field, values) {
    const normalizedValues = new Set(
      Array.isArray(values) ? values : values ? [values] : []
    );

    field.querySelectorAll(".chip").forEach((chip) => {
      setChipSelected(chip, normalizedValues.has(chip.dataset.value));
    });
  }

  function synchronizeChipClasses() {
    dom.chips.forEach((chip) => {
      chip.classList.toggle(
        "selected",
        chip.getAttribute("aria-pressed") === "true"
      );
    });
  }

  /* ==========================================================================
     LOCKING
     ========================================================================== */

  function toggleCategoryLock(category, button) {
    if (!category) {
      return;
    }

    const willLock = !state.lockedCategories.has(category);

    if (willLock) {
      state.lockedCategories.add(category);
    } else {
      state.lockedCategories.delete(category);
    }

    updateCategoryLockPresentation(category, willLock);

    if (button) {
      button.textContent = willLock ? "Unlock" : "Lock";
      button.setAttribute("aria-pressed", String(willLock));
    }

    showToast(
      willLock
        ? `${getCategoryDisplayName(category)} locked.`
        : `${getCategoryDisplayName(category)} unlocked.`,
      "success"
    );
  }

  function updateCategoryLockPresentation(category, locked) {
    const card = getCategoryCard(category);
    if (!card) {
      return;
    }

    card.classList.toggle("locked", locked);
    card.classList.toggle("is-locked", locked);

    const lockButton = document.getElementById(`lock-${category}`);
    if (lockButton) {
      lockButton.textContent = locked ? "Unlock" : "Lock";
      lockButton.setAttribute("aria-pressed", String(locked));
      lockButton.classList.toggle("locked", locked);
      lockButton.classList.toggle("is-locked", locked);
    }

    card.querySelectorAll(".field, .chip-field").forEach((field) => {
      field.classList.toggle("locked", locked);
      field.classList.toggle("is-locked", locked);
    });
  }

  function isCategoryLocked(category) {
    return state.lockedCategories.has(category);
  }

  function isElementLocked(element) {
    const category = element.dataset.category;
    return category ? isCategoryLocked(category) : false;
  }

  /* ==========================================================================
     RANDOMIZATION
     ========================================================================== */

  function randomizeAll() {
    dom.categoryCards.forEach((card) => {
      const category = card.dataset.category;

      if (
        !category ||
        isCategoryLocked(category) ||
        card.hidden ||
        card.classList.contains("is-hidden") ||
        card.dataset.conditionalHidden === "true"
      ) {
        return;
      }

      randomizeCategory(category, false);
    });

    updateConditionalCategories();
    synchronizeAnatomyForCreationType();
    synchronizeTextRequirement();
    markPromptStale();
    showToast("Unlocked selections were randomized.", "success");
  }

  function randomizeCategory(category, notify = true) {
    if (!category || isCategoryLocked(category)) {
      if (notify) {
        showToast(
          `${getCategoryDisplayName(category)} is locked and was not changed.`,
          "warning"
        );
      }
      return;
    }

    const card = getCategoryCard(category);

    if (
      !card ||
      card.hidden ||
      card.classList.contains("is-hidden") ||
      card.dataset.conditionalHidden === "true"
    ) {
      return;
    }

    const controls = Array.from(
      card.querySelectorAll(
        'select[data-randomizable="true"], input[data-randomizable="true"], textarea[data-randomizable="true"]'
      )
    );

    controls.forEach((control) => {
      if (RANDOMIZE_EXCLUDED_KEYS.has(control.dataset.key)) {
        return;
      }

      if (control instanceof HTMLSelectElement) {
        randomizeSelect(control);
      }
    });

    card
      .querySelectorAll('.chip-field[data-randomizable="true"]')
      .forEach((field) => randomizeChipField(field));

    if (category === "creationType") {
      updateConditionalCategories();
      synchronizeAnatomyForCreationType();
    }

    if (category === "finish") {
      synchronizeTextRequirement();
    }

    markPromptStale();

    if (notify) {
      showToast(
        `${getCategoryDisplayName(category)} randomized.`,
        "success"
      );
    }
  }

  function randomizeSelect(select) {
    const eligibleOptions = Array.from(select.options).filter((option) => {
      return !option.disabled && option.value !== "";
    });

    if (!eligibleOptions.length) {
      return;
    }

    const chosen = eligibleOptions[randomInteger(0, eligibleOptions.length - 1)];
    select.value = chosen.value;
    clearControlError(select);
  }

  function randomizeChipField(field) {
    if (isElementLocked(field)) {
      return;
    }

    const maxSelections = Number(field.dataset.maxSelections || 1);
    const eligibleChips = Array.from(field.querySelectorAll(".chip")).filter(
      (chip) => chip.dataset.value !== "None" && !chip.disabled
    );

    field.querySelectorAll(".chip").forEach((chip) => {
      setChipSelected(chip, false);
    });

    if (!eligibleChips.length) {
      return;
    }

    const maximumRandomSelections = Math.min(maxSelections, 3, eligibleChips.length);
    const selectionCount = randomInteger(1, maximumRandomSelections);
    const shuffled = shuffleArray(eligibleChips);

    shuffled.slice(0, selectionCount).forEach((chip) => {
      setChipSelected(chip, true);
    });
  }

  /* ==========================================================================
     PRESETS
     ========================================================================== */

  function applyPreset(presetId) {
    const preset = presets[presetId];

    if (!preset) {
      showToast("The selected preset could not be found.", "error");
      return;
    }

    Object.entries(preset).forEach(([key, value]) => {
      const control = getControlByKey(key);
      const chipField = getChipFieldByKey(key);
      const category = control?.dataset.category || chipField?.dataset.category;

      if (category && isCategoryLocked(category)) {
        return;
      }

      if (PROTECTED_TEXT_KEYS.has(key)) {
        return;
      }

      if (control) {
        setControlValue(control, value);
      } else if (chipField) {
        setChipValues(chipField, value);
      }
    });

    updateConditionalCategories();
    synchronizeAnatomyForCreationType();
    synchronizeTextRequirement();
    markPromptStale();
    highlightAppliedPreset(presetId);

    showToast(
      "Preset applied. Locked selections and written details were preserved.",
      "success"
    );
  }

  function highlightAppliedPreset(presetId) {
    document.querySelectorAll(".preset-card").forEach((card) => {
      card.classList.toggle(
        "is-applied",
        card.dataset.presetId === presetId
      );
    });

    window.setTimeout(() => {
      document
        .querySelectorAll(".preset-card.is-applied")
        .forEach((card) => card.classList.remove("is-applied"));
    }, 1800);
  }

  /* ==========================================================================
     CLEARING
     ========================================================================== */

  function requestClearCategory(category, trigger) {
    if (!category) {
      return;
    }

    if (isCategoryLocked(category)) {
      showToast(
        `${getCategoryDisplayName(category)} is locked. Unlock it before clearing.`,
        "warning"
      );
      return;
    }

    if (categoryContainsWrittenText(category)) {
      openConfirmationModal({
        title: `Clear ${getCategoryDisplayName(category)}?`,
        message:
          "This category contains written details. Clearing it will restore its approved defaults.",
        confirmLabel: "Clear Category",
        action: "clear-category",
        payload: category,
        trigger
      });
      return;
    }

    clearCategory(category);
  }

  function clearCategory(category) {
    const defaults = categoryDefaults[category];
    const card = getCategoryCard(category);

    if (!defaults || !card || isCategoryLocked(category)) {
      return;
    }

    Object.entries(defaults).forEach(([key, value]) => {
      const control = getControlByKey(key);
      const chipField = getChipFieldByKey(key);

      if (control) {
        setControlValue(control, value);
      } else if (chipField) {
        setChipValues(chipField, value);
      }
    });

    clearCategoryErrors(card);
    updateConditionalCategories();
    synchronizeAnatomyForCreationType();
    synchronizeTextRequirement();
    markPromptStale();

    showToast(
      `${getCategoryDisplayName(category)} restored to defaults.`,
      "success"
    );
  }

  function clearAll() {
    state.lockedCategories.clear();

    Object.entries(categoryDefaults).forEach(([category, defaults]) => {
      Object.entries(defaults).forEach(([key, value]) => {
        const control = getControlByKey(key);
        const chipField = getChipFieldByKey(key);

        if (control) {
          setControlValue(control, value);
        } else if (chipField) {
          setChipValues(chipField, value);
        }
      });

      updateCategoryLockPresentation(category, false);
    });

    state.generatedPrompt = "";
    state.generatedSnapshot = "";
    state.isStale = false;

    clearAllValidation();
    updateConditionalCategories();
    synchronizeAnatomyForCreationType();
    synchronizeTextRequirement();
    updatePromptState("empty");
    updateQualityState("empty");
    dom.updateNeededMessage.hidden = true;
    updateCopyButton();
    activateStudio("inspiration");

    showToast("The current project was cleared.", "success");
  }

  function categoryContainsWrittenText(category) {
    const card = getCategoryCard(category);
    if (!card) {
      return false;
    }

    return Array.from(card.querySelectorAll("input, textarea")).some(
      (control) => control.value.trim() !== ""
    );
  }

  /* ==========================================================================
     CONDITIONAL VISIBILITY
     ========================================================================== */

  function updateConditionalCategories() {
    const creationType = dom.creationType.value;
    const characterCard = document.querySelector(
      '[data-conditional-category="character"]'
    );
    const productCard = document.querySelector(
      '[data-conditional-category="product"]'
    );

    const showCharacter =
      CHARACTER_CREATION_TYPES.has(creationType) &&
      !ENVIRONMENT_ONLY_TYPES.has(creationType);

    const showProduct =
      PRODUCT_CREATION_TYPES.has(creationType) &&
      !ENVIRONMENT_ONLY_TYPES.has(creationType);

    setConditionalCategoryVisibility(characterCard, showCharacter);
    setConditionalCategoryVisibility(productCard, showProduct);
  }

  function setConditionalCategoryVisibility(card, visible) {
    if (!card) {
      return;
    }

    card.classList.toggle("is-hidden", !visible);
    card.dataset.conditionalHidden = String(!visible);
    card.setAttribute("aria-hidden", String(!visible));

    card
      .querySelectorAll("input, select, textarea, button.chip")
      .forEach((control) => {
        control.disabled = !visible;
      });
  }

  function synchronizeAnatomyForCreationType() {
    const anatomyControl = document.getElementById("input-anatomy-guidance");
    const creationType = dom.creationType.value;

    if (!anatomyControl || isCategoryLocked("finish")) {
      return;
    }

    if (PRODUCT_ONLY_TYPES.has(creationType)) {
      anatomyControl.value = "Product Only, No Anatomy";
    } else if (
      creationType === "Fashion Doll" ||
      creationType === "Collectible Figure"
    ) {
      anatomyControl.value = "Accurate Doll Anatomy";
    } else if (creationType === "Plush Character") {
      anatomyControl.value = "Chibi Proportions with Clean Anatomy";
    } else if (anatomyControl.value === "Product Only, No Anatomy") {
      anatomyControl.value = "Accurate Natural Anatomy";
    }
  }

  function synchronizeTextRequirement() {
    const requiresText =
      dom.textRequirement.value !== "No Text Required";

    dom.productLabelText.setAttribute(
      "aria-required",
      String(requiresText)
    );
  }

  /* ==========================================================================
     VALIDATION
     ========================================================================== */

  function validateApplication() {
    clearAllValidation();

    const errors = [];
    const stateData = collectFormState();
    const creationType = stateData.creationType;
    const hasCharacter = isCharacterCategoryActive();
    const hasProduct = isProductCategoryActive();

    const requiredControls = [
      ["inspirationCategory", "Select an inspiration category."],
      ["inspirationSource", "Select an inspiration source."],
      ["inspirationName", "Enter a brand, product, or theme name."],
      ["influenceStrength", "Select an influence strength."],
      ["creationType", "Select a creation type."],
      ["presentationPurpose", "Select a presentation purpose."],
      ["styleFamily", "Select a style family."],
      ["visualStyle", "Select a main visual style."],
      ["realismLevel", "Select a realism level."],
      ["detailLevel", "Select a detail level."],
      ["backgroundTreatment", "Select a background treatment."],
      ["colorStrategy", "Select a color strategy."],
      ["mainPalette", "Select a main palette."],
      ["lightingStyle", "Select a lighting style."],
      ["lightQuality", "Select a light quality."],
      ["poseArrangement", "Select a pose or arrangement."],
      ["cameraView", "Select a camera view."],
      ["framing", "Select framing."],
      ["perspective", "Select a perspective."],
      ["compositionStyle", "Select a composition style."],
      ["focalEmphasis", "Select a focal emphasis."],
      ["aspectRatio", "Select an aspect ratio."],
      ["renderQuality", "Select render quality."],
      ["textRequirement", "Select a text requirement."],
      ["anatomyGuidance", "Select anatomy guidance."],
      ["productVisibility", "Select product visibility."]
    ];

    if (hasCharacter) {
      requiredControls.push(
        ["characterType", "Select a character type."],
        ["ageGroup", "Select an age group."]
      );
    }

    if (hasProduct) {
      requiredControls.push(
        ["productCategory", "Select a product category."],
        ["productForm", "Select a product form."],
        ["productPlacement", "Select product placement."]
      );
    }

    requiredControls.forEach(([key, message]) => {
      const control = getControlByKey(key);
      if (!control || control.disabled) {
        return;
      }

      const value = String(control.value || "").trim();

      if (!value) {
        addValidationError(control, message, errors);
      }
    });

    const inspirationName = getControlByKey("inspirationName");
    if (
      inspirationName &&
      inspirationName.value.trim() &&
      inspirationName.value.trim().length < 2
    ) {
      addValidationError(
        inspirationName,
        "The brand, product, or theme name must contain at least 2 characters.",
        errors
      );
    }

    const textRequired =
      stateData.textRequirement &&
      stateData.textRequirement !== "No Text Required";

    if (textRequired && !stateData.productLabelText.trim()) {
      addValidationError(
        dom.productLabelText,
        "Enter the exact wording required in the image.",
        errors
      );
    }

    validateChipSelectionLimits(errors);

    if (
      PRODUCT_ONLY_TYPES.has(creationType) &&
      stateData.anatomyGuidance !== "Product Only, No Anatomy"
    ) {
      stateData.anatomyGuidance = "Product Only, No Anatomy";
    }

    renderValidationSummary(errors);

    return {
      valid: errors.length === 0,
      errors,
      data: stateData
    };
  }

  function validateChipSelectionLimits(errors) {
    dom.chipFields.forEach((field) => {
      if (field.closest(".is-hidden") || field.disabled) {
        return;
      }

      const maximum = Number(field.dataset.maxSelections || 1);
      const selected = getChipValues(field);

      if (selected.length > maximum) {
        field.classList.add("invalid");
        errors.push({
          element: field,
          message: `Select no more than ${maximum} options for ${getFieldDisplayName(
            field
          )}.`
        });
      }
    });
  }

  function addValidationError(control, message, errors) {
    control.setAttribute("aria-invalid", "true");
    control.closest(".field")?.classList.add("invalid");
    control.closest(".category-card")?.classList.add("invalid");

    errors.push({
      element: control,
      message
    });
  }

  function renderValidationSummary(errors) {
    dom.validationList.replaceChildren();

    if (!errors.length) {
      dom.validationSummary.hidden = true;
      return;
    }

    errors.forEach((error) => {
      const item = document.createElement("li");
      const link = document.createElement("button");

      link.type = "button";
      link.className = "validation-link";
      link.textContent = error.message;

      link.addEventListener("click", () => {
        revealAndFocusElement(error.element);
      });

      item.append(link);
      dom.validationList.append(item);
    });

    dom.validationSummary.hidden = false;
  }

  function clearControlError(control) {
    control.removeAttribute("aria-invalid");
    control.closest(".field")?.classList.remove("invalid");

    const card = control.closest(".category-card");
    if (card) {
      const hasRemainingErrors = card.querySelector(
        '[aria-invalid="true"], .field.invalid, .chip-field.invalid'
      );

      if (!hasRemainingErrors) {
        card.classList.remove("invalid");
      }
    }
  }

  function clearCategoryErrors(card) {
    card.classList.remove("invalid", "has-error");

    card.querySelectorAll('[aria-invalid="true"]').forEach((control) => {
      control.removeAttribute("aria-invalid");
    });

    card.querySelectorAll(".invalid, .has-error").forEach((element) => {
      element.classList.remove("invalid", "has-error");
    });
  }

  function clearAllValidation() {
    dom.validationSummary.hidden = true;
    dom.validationList.replaceChildren();

    document.querySelectorAll('[aria-invalid="true"]').forEach((control) => {
      control.removeAttribute("aria-invalid");
    });

    document
      .querySelectorAll(".invalid, .has-error")
      .forEach((element) =>
        element.classList.remove("invalid", "has-error")
      );
  }

  function revealAndFocusElement(element) {
    const panel = element.closest(".studio-panel");
    const details = element.closest("details");

    if (panel) {
      activateStudio(panel.dataset.studioPanel);
    }

    if (details) {
      details.open = true;
    }

    window.setTimeout(() => {
      element.focus?.();
      element.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center"
      });
    }, 30);
  }

  /* ==========================================================================
     FORM STATE COLLECTION
     ========================================================================== */

  function collectFormState() {
    const data = {};

    dom.formControls.forEach((control) => {
      if (control.disabled) {
        return;
      }

      data[control.dataset.key] =
        typeof control.value === "string"
          ? control.value.trim()
          : control.value;
    });

    dom.chipFields.forEach((field) => {
      if (
        field.closest(".is-hidden") ||
        field.dataset.conditionalHidden === "true"
      ) {
        return;
      }

      data[field.dataset.key] = getChipValues(field);
    });

    return data;
  }

  function createStateSnapshot() {
    const data = collectFormState();

    return JSON.stringify({
      data,
      locks: Array.from(state.lockedCategories).sort()
    });
  }

  /* ==========================================================================
     PROMPT GENERATION
     ========================================================================== */

  function generatePrompt() {
    setGenerateLoading(true);

    window.setTimeout(() => {
      const validation = validateApplication();

      if (!validation.valid) {
        setGenerateLoading(false);
        activateStudio("prompt");
        dom.validationSummary.focus();
        showToast(
          "Please review the highlighted selections before generating your prompt.",
          "error"
        );
        return;
      }

      const prompt = assemblePrompt(validation.data);

      state.generatedPrompt = prompt;
      state.generatedSnapshot = createStateSnapshot();
      state.isStale = false;

      renderGeneratedPrompt(prompt);
      renderQualityResult(runQualityCheck(prompt, validation.data));
      savePromptToHistory(prompt, validation.data);
      clearAllValidation();
      updateCopyButton();
      setGenerateLoading(false);
      activateStudio("prompt");

      showToast("Your BrandVerse image prompt is ready.", "success");
    }, 180);
  }

  function assemblePrompt(data) {
    const sections = [];
    const creationType = data.creationType;
    const hasCharacter = isCharacterCategoryActive();
    const hasProduct = isProductCategoryActive();
    const productOnly = PRODUCT_ONLY_TYPES.has(creationType);
    const environmentOnly = ENVIRONMENT_ONLY_TYPES.has(creationType);

    sections.push(
      buildSentence(
        `Create ${articleFor(data.subjectCount)} ${normalizeSubjectCount(
          data.subjectCount
        )} ${data.creationType.toLowerCase()} as ${articleFor(
          data.presentationPurpose
        )} ${data.presentationPurpose.toLowerCase()}`
      )
    );

    const inspirationDetails = [
      data.inspirationCategory,
      data.inspirationSource,
      quoted(data.inspirationName)
    ].filter(Boolean);

    sections.push(
      buildSentence(
        `Use ${joinNatural(inspirationDetails)} as ${data.influenceStrength.toLowerCase()} creative inspiration`
      )
    );

    sections.push(
      "Interpret the inspiration as an original visual concept rather than an exact recreation of protected artwork, logos, characters, packaging, or an existing campaign."
    );

    if (data.targetAudience && data.targetAudience !== "General Audience") {
      sections.push(
        buildSentence(
          `Design the visual for ${data.targetAudience.toLowerCase()}`
        )
      );
    }

    if (data.customConcept) {
      sections.push(buildSentence(`Creative direction: ${data.customConcept}`));
    }

    if (data.referenceDirection) {
      sections.push(
        buildSentence(
          `Reference-image inspiration: borrow only the broad visual qualities described here—${data.referenceDirection}`
        )
      );
    }

    if (hasCharacter && !environmentOnly) {
      sections.push(buildCharacterSection(data));
    }

    if (hasProduct && !environmentOnly) {
      sections.push(buildProductSection(data));
    }

    if (environmentOnly) {
      sections.push(
        buildSentence(
          `Make the ${creationType.toLowerCase()} itself the primary subject`
        )
      );
    }

    sections.push(buildStyleSection(data));
    sections.push(buildEnvironmentSection(data));
    sections.push(buildColorLightingSection(data));
    sections.push(buildCompositionSection(data));
    sections.push(buildFinishSection(data, productOnly, hasProduct));

    if (
      data.textRequirement &&
      data.textRequirement !== "No Text Required" &&
      data.productLabelText
    ) {
      sections.push(
        `Render the required wording exactly as “${cleanExactText(
          data.productLabelText
        )}.” Preserve spelling, capitalization, punctuation, spacing, and readability. Do not add unrelated text.`
      );
    }

    if (data.mustInclude) {
      sections.push(buildSentence(`Must include: ${data.mustInclude}`));
    }

    if (data.additionalDirection) {
      sections.push(
        buildSentence(`Additional direction: ${data.additionalDirection}`)
      );
    }

    const exclusionItems = deduplicateStrings([
      ...(data.negativeGuidance || []),
      data.customExclusions,
      data.mustAvoid
    ]);

    if (exclusionItems.length) {
      sections.push(
        buildSentence(`Avoid ${joinNatural(exclusionItems)}`)
      );
    }

    sections.push(
      "Use clear universal image-generation language without model-specific commands. Keep the main subject coherent, fully readable, visually balanced, commercially polished, and faithful to the approved creative direction."
    );

    return cleanPrompt(
      sections.filter(Boolean).join("\n\n")
    );
  }

  function buildCharacterSection(data) {
    const descriptors = [];

    if (data.characterType) {
      descriptors.push(data.characterType.toLowerCase());
    }

    if (
      data.genderPresentation &&
      !["User Choice", "Not Applicable"].includes(data.genderPresentation)
    ) {
      descriptors.push(
        `${data.genderPresentation.toLowerCase()} presentation`
      );
    }

    if (
      data.ageGroup &&
      data.ageGroup !== "Not Applicable"
    ) {
      descriptors.push(`${data.ageGroup.toLowerCase()} age group`);
    }

    if (
      data.skinTone &&
      data.skinTone !== "Custom or Unspecified"
    ) {
      descriptors.push(`${data.skinTone.toLowerCase()} skin tone`);
    }

    if (
      data.bodyType &&
      data.bodyType !== "Custom or Unspecified"
    ) {
      descriptors.push(`${data.bodyType.toLowerCase()} body type`);
    }

    const sentences = [
      buildSentence(
        `Character design: create ${articleFor(
          descriptors[0] || "original character"
        )} ${joinNatural(descriptors) || "original character"}`
      )
    ];

    const hairDetails = [];

    if (
      data.hairStyle &&
      data.hairStyle !== "Custom or Unspecified"
    ) {
      hairDetails.push(data.hairStyle.toLowerCase());
    }

    if (
      data.hairColor &&
      data.hairColor !== "Custom or Unspecified"
    ) {
      hairDetails.push(`${data.hairColor.toLowerCase()} hair`);
    }

    if (hairDetails.length) {
      sentences.push(
        buildSentence(`Hair: ${joinNatural(hairDetails)}`)
      );
    }

    if (data.facialDetails?.length) {
      sentences.push(
        buildSentence(
          `Facial details: ${joinNatural(
            data.facialDetails.map(lowercaseFirst)
          )}`
        )
      );
    }

    if (data.expression) {
      sentences.push(
        buildSentence(
          `Give the character a clearly rendered ${data.expression.toLowerCase()} expression`
        )
      );
    }

    if (data.outfitDirection) {
      sentences.push(
        buildSentence(
          `Style the character in ${data.outfitDirection.toLowerCase()}`
        )
      );
    }

    if (data.accessories?.length) {
      sentences.push(
        buildSentence(
          `Accessories: ${joinNatural(
            data.accessories.map(lowercaseFirst)
          )}`
        )
      );
    }

    if (data.characterProps?.length) {
      sentences.push(
        buildSentence(
          `Character props: ${joinNatural(
            data.characterProps.map(lowercaseFirst)
          )}`
        )
      );
    }

    if (data.characterNotes) {
      sentences.push(
        buildSentence(`Character notes: ${data.characterNotes}`)
      );
    }

    return sentences.filter(Boolean).join(" ");
  }

  function buildProductSection(data) {
    const productDescriptors = [
      data.productCategory,
      data.productForm,
      data.productCondition
    ]
      .filter(Boolean)
      .map(lowercaseFirst);

    const sentences = [
      buildSentence(
        `Product design: feature ${articleFor(
          productDescriptors[0] || "original product"
        )} ${joinNatural(productDescriptors) || "original product"}`
      )
    ];

    if (data.packagingStyle && data.packagingStyle !== "None") {
      sentences.push(
        buildSentence(
          `Use ${data.packagingStyle.toLowerCase()}`
        )
      );
    }

    if (data.productMaterial?.length) {
      sentences.push(
        buildSentence(
          `Materials and surfaces: ${joinNatural(
            data.productMaterial.map(lowercaseFirst)
          )}`
        )
      );
    }

    if (data.productPlacement) {
      sentences.push(
        buildSentence(
          `Place the product in a ${data.productPlacement.toLowerCase()}`
        )
      );
    }

    if (data.productNotes) {
      sentences.push(
        buildSentence(`Product notes: ${data.productNotes}`)
      );
    }

    return sentences.filter(Boolean).join(" ");
  }

  function buildStyleSection(data) {
    const details = [
      data.styleFamily,
      data.visualStyle,
      data.realismLevel,
      data.detailLevel,
      data.lineTreatment !== "None" ? data.lineTreatment : ""
    ].filter(Boolean);

    if (data.visualFinish?.length) {
      details.push(...data.visualFinish);
    }

    return buildSentence(
      `Art direction: ${joinNatural(
        deduplicateStrings(details).map(lowercaseFirst)
      )}`
    );
  }

  function buildEnvironmentSection(data) {
    const details = [];

    if (data.environmentType && data.environmentType !== "None") {
      details.push(data.environmentType.toLowerCase());
    }

    if (data.setting) {
      details.push(data.setting.toLowerCase());
    }

    if (data.backgroundTreatment) {
      details.push(data.backgroundTreatment.toLowerCase());
    }

    if (data.sceneDensity) {
      details.push(`${data.sceneDensity.toLowerCase()} scene density`);
    }

    if (data.environmentProps?.length) {
      details.push(
        `supporting props including ${joinNatural(
          data.environmentProps.map(lowercaseFirst)
        )}`
      );
    }

    if (!details.length) {
      return "";
    }

    return buildSentence(`Environment: ${joinNatural(details)}`);
  }

  function buildColorLightingSection(data) {
    const paletteParts = [
      data.colorStrategy,
      data.mainPalette
    ].filter(Boolean);

    if (data.customColors) {
      paletteParts.push(`custom colors: ${data.customColors}`);
    }

    const lightingParts = [
      data.lightingStyle,
      data.lightQuality
        ? `${data.lightQuality.toLowerCase()} light quality`
        : ""
    ].filter(Boolean);

    const moodParts = [
      data.atmosphere,
      ...(data.mood || [])
    ].filter(Boolean);

    const sections = [];

    if (paletteParts.length) {
      sections.push(
        `Color direction: ${joinNatural(
          paletteParts.map(lowercaseFirst)
        )}`
      );
    }

    if (lightingParts.length) {
      sections.push(
        `lighting: ${joinNatural(
          lightingParts.map(lowercaseFirst)
        )}`
      );
    }

    if (moodParts.length) {
      sections.push(
        `mood: ${joinNatural(
          deduplicateStrings(moodParts).map(lowercaseFirst)
        )}`
      );
    }

    return buildSentence(sections.join("; "));
  }

  function buildCompositionSection(data) {
    const details = [
      data.poseArrangement,
      data.cameraView,
      data.framing,
      data.perspective,
      data.compositionStyle,
      data.focalEmphasis
        ? `${data.focalEmphasis} as the focal emphasis`
        : "",
      data.aspectRatio
    ].filter(Boolean);

    return buildSentence(
      `Composition: ${joinNatural(
        details.map(lowercaseFirst)
      )}`
    );
  }

  function buildFinishSection(data, productOnly, hasProduct) {
    const parts = [];

    if (data.textureDirection?.length) {
      parts.push(
        `textures: ${joinNatural(
          data.textureDirection.map(lowercaseFirst)
        )}`
      );
    }

    if (data.renderQuality) {
      parts.push(`quality: ${data.renderQuality.toLowerCase()}`);
    }

    if (!productOnly && data.anatomyGuidance) {
      parts.push(
        `anatomy: ${data.anatomyGuidance.toLowerCase()}`
      );
    }

    if (hasProduct && data.productVisibility) {
      parts.push(
        `product visibility: ${data.productVisibility.toLowerCase()}`
      );
    }

    return buildSentence(`Professional finish: ${parts.join("; ")}`);
  }

  /* ==========================================================================
     PROMPT CLEANUP
     ========================================================================== */

  function cleanPrompt(prompt) {
    const paragraphs = prompt
      .split(/\n{2,}/)
      .map((paragraph) =>
        paragraph
          .replace(/\s+/g, " ")
          .replace(/\s+([,.;:!?])/g, "$1")
          .replace(/([,;:])\1+/g, "$1")
          .trim()
      )
      .filter(Boolean);

    const uniqueParagraphs = [];
    const seen = new Set();

    paragraphs.forEach((paragraph) => {
      const normalized = paragraph.toLowerCase();

      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueParagraphs.push(ensureTerminalPunctuation(paragraph));
      }
    });

    return uniqueParagraphs.join("\n\n");
  }

  function ensureTerminalPunctuation(text) {
    if (!text) {
      return "";
    }

    return /[.!?]$/.test(text) ? text : `${text}.`;
  }

  function buildSentence(text) {
    return ensureTerminalPunctuation(
      String(text || "")
        .replace(/\s+/g, " ")
        .replace(/\s+([,.;:!?])/g, "$1")
        .trim()
    );
  }

  function cleanExactText(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/[“”]/g, '"')
      .trim();
  }

  /* ==========================================================================
     OUTPUT RENDERING
     ========================================================================== */

  function renderGeneratedPrompt(prompt) {
    dom.promptOutput.textContent = prompt;
    updatePromptState("generated");
    dom.updateNeededMessage.hidden = true;
  }

  function updatePromptState(status) {
    dom.promptOutput.classList.remove(
      "empty",
      "generated",
      "stale",
      "loading"
    );

    dom.promptOutput.classList.add(status);
    dom.promptOutput.dataset.outputState = status;

    if (status === "empty") {
      dom.promptOutput.textContent =
        "Build your concept, then select Generate Prompt.";
    }
  }

  function markPromptStale() {
    if (!state.generatedPrompt) {
      return;
    }

    const currentSnapshot = createStateSnapshot();

    if (currentSnapshot === state.generatedSnapshot) {
      state.isStale = false;
      dom.updateNeededMessage.hidden = true;
      updatePromptState("generated");
      return;
    }

    state.isStale = true;
    dom.updateNeededMessage.hidden = false;
    updatePromptState("stale");
  }

  function setGenerateLoading(loading) {
    dom.generateButton.disabled = loading;
    dom.generateButton.classList.toggle("is-loading", loading);
    dom.generateButton.setAttribute("aria-busy", String(loading));

    if (loading) {
      updatePromptState("loading");
    } else if (!state.generatedPrompt) {
      updatePromptState("empty");
    }
  }

  function updateCopyButton() {
    dom.copyButton.disabled = !state.generatedPrompt;
  }

  /* ==========================================================================
     QUALITY CHECKER
     ========================================================================== */

  function runQualityCheck(prompt, data) {
    const checks = [];
    const warnings = [];

    checks.push({
      passed: prompt.length >= 300,
      label: "Prompt contains substantial creative detail."
    });

    checks.push({
      passed: Boolean(data.inspirationName),
      label: "The inspiration concept is clearly identified."
    });

    checks.push({
      passed: Boolean(data.visualStyle && data.realismLevel),
      label: "Style and realism direction are included."
    });

    checks.push({
      passed: Boolean(
        data.compositionStyle &&
          data.cameraView &&
          data.framing &&
          data.aspectRatio
      ),
      label: "Composition and format instructions are included."
    });

    checks.push({
      passed: Boolean(data.lightingStyle && data.mainPalette),
      label: "Lighting and color direction are included."
    });

    checks.push({
      passed: Boolean(
        data.renderQuality &&
          (data.negativeGuidance?.length || data.customExclusions)
      ),
      label: "Commercial-quality protection is included."
    });

    checks.push({
      passed: /original visual concept/i.test(prompt),
      label: "Originality guidance is included."
    });

    if (
      data.textRequirement !== "No Text Required" &&
      !data.productLabelText
    ) {
      warnings.push("Exact image text is required but no wording was supplied.");
    }

    if (
      data.mainPalette === "Custom Brand Colors" &&
      !data.customColors
    ) {
      warnings.push(
        "The palette is set to Custom Brand Colors, but no custom colors were entered."
      );
    }

    if (
      data.influenceStrength === "Strong" &&
      !/original visual concept/i.test(prompt)
    ) {
      warnings.push(
        "Strong inspiration should include clear originality guidance."
      );
    }

    const passedCount = checks.filter((check) => check.passed).length;
    const totalCount = checks.length;

    let status = "success";
    let heading = "Prompt passed the main quality checks.";

    if (warnings.length || passedCount < totalCount) {
      status = passedCount >= totalCount - 1 ? "warning" : "error";
      heading =
        status === "warning"
          ? "Prompt is strong, with a few items to review."
          : "Prompt needs additional attention.";
    }

    return {
      status,
      heading,
      passedCount,
      totalCount,
      checks,
      warnings
    };
  }

  function renderQualityResult(result) {
    dom.qualityResult.className = `quality-card ${result.status}`;
    dom.qualityResult.dataset.qualityState = result.status;
    dom.qualityResult.replaceChildren();

    const eyebrow = document.createElement("p");
    eyebrow.className = "section-eyebrow";
    eyebrow.textContent = "Prompt Quality Check";

    const heading = document.createElement("h3");
    heading.textContent = result.heading;

    const summary = document.createElement("p");
    summary.textContent = `${result.passedCount} of ${result.totalCount} primary checks passed.`;

    const list = document.createElement("ul");

    result.checks.forEach((check) => {
      const item = document.createElement("li");
      item.textContent = `${check.passed ? "Passed" : "Review"}: ${
        check.label
      }`;
      list.append(item);
    });

    result.warnings.forEach((warning) => {
      const item = document.createElement("li");
      item.textContent = `Review: ${warning}`;
      list.append(item);
    });

    dom.qualityResult.append(eyebrow, heading, summary, list);
  }

  function updateQualityState(status) {
    dom.qualityResult.className = `quality-card ${status}`;
    dom.qualityResult.dataset.qualityState = status;
    dom.qualityResult.innerHTML = `
      <p class="section-eyebrow">Prompt Quality Check</p>
      <h3>Quality Result</h3>
      <p>Quality results will appear after generation.</p>
    `;
  }

  /* ==========================================================================
     COPY
     ========================================================================== */

  async function copyCurrentPrompt() {
    if (!state.generatedPrompt) {
      showToast("Generate a prompt before copying.", "warning");
      return;
    }

    const copied = await copyText(state.generatedPrompt);

    showToast(
      copied
        ? "Prompt copied successfully."
        : "The prompt could not be copied.",
      copied ? "success" : "error"
    );
  }

  async function copyHistoryPrompt(historyId) {
    const item = state.history.find(
      (historyItem) => historyItem.id === historyId
    );

    if (!item) {
      showToast("That history item could not be found.", "error");
      return;
    }

    const copied = await copyText(item.prompt);
    showToast(
      copied
        ? "History prompt copied successfully."
        : "The prompt could not be copied.",
      copied ? "success" : "error"
    );
  }

  async function copyText(text) {
    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(text);
        return true;
      }

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();

      const copied = document.execCommand("copy");
      textarea.remove();

      return copied;
    } catch {
      return false;
    }
  }

  /* ==========================================================================
     HISTORY
     ========================================================================== */

  function loadHistory() {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];

      state.history = Array.isArray(parsed)
        ? parsed.filter(isValidHistoryItem).slice(0, MAX_HISTORY_ITEMS)
        : [];
    } catch {
      state.history = [];
    }
  }

  function persistHistory() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state.history)
      );
    } catch {
      showToast(
        "Prompt history could not be saved in this browser.",
        "warning"
      );
    }
  }

  function savePromptToHistory(prompt, formData) {
    const duplicateIndex = state.history.findIndex(
      (item) => normalizeText(item.prompt) === normalizeText(prompt)
    );

    if (duplicateIndex !== -1) {
      const [existing] = state.history.splice(duplicateIndex, 1);
      existing.createdAt = new Date().toISOString();
      existing.formData = formData;
      state.history.unshift(existing);
    } else {
      state.history.unshift({
        id: createUniqueId(),
        prompt,
        formData,
        createdAt: new Date().toISOString()
      });
    }

    state.history = state.history.slice(0, MAX_HISTORY_ITEMS);
    persistHistory();
    renderHistory();
  }

  function renderHistory() {
    dom.historyContainer.replaceChildren();

    if (!state.history.length) {
      const empty = document.createElement("p");
      empty.className = "history-empty";
      empty.textContent = "No generated prompts yet.";
      dom.historyContainer.append(empty);
      return;
    }

    state.history.forEach((item) => {
      const article = document.createElement("article");
      article.className = "history-item";
      article.dataset.historyId = item.id;

      const content = document.createElement("div");
      content.className = "history-item__content";

      const time = document.createElement("time");
      time.dateTime = item.createdAt;
      time.textContent = formatHistoryDate(item.createdAt);

      const preview = document.createElement("p");
      preview.textContent = item.prompt;

      content.append(time, preview);

      const actions = document.createElement("div");
      actions.className = "history-item__actions";

      const loadButton = createHistoryButton(
        "Load",
        "load-history",
        item.id,
        "button button--secondary"
      );

      const copyButton = createHistoryButton(
        "Copy",
        "copy-history",
        item.id,
        "button button--secondary"
      );

      const deleteButton = createHistoryButton(
        "Delete",
        "delete-history",
        item.id,
        "button button--danger-outline"
      );

      actions.append(loadButton, copyButton, deleteButton);
      article.append(content, actions);
      dom.historyContainer.append(article);
    });
  }

  function createHistoryButton(label, action, id, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.dataset.action = action;
    button.dataset.historyId = id;
    return button;
  }

  function loadHistoryPrompt(historyId) {
    const item = state.history.find(
      (historyItem) => historyItem.id === historyId
    );

    if (!item) {
      showToast("That history item could not be found.", "error");
      return;
    }

    state.generatedPrompt = item.prompt;
    state.generatedSnapshot = createStateSnapshot();
    state.isStale = false;

    renderGeneratedPrompt(item.prompt);
    renderQualityResult(
      runQualityCheck(item.prompt, item.formData || collectFormState())
    );
    updateCopyButton();
    activateStudio("prompt");

    showToast("History prompt loaded.", "success");
  }

  function requestDeleteHistory(historyId, trigger) {
    if (!historyId) {
      return;
    }

    openConfirmationModal({
      title: "Delete this prompt?",
      message: "Delete this prompt from your history?",
      confirmLabel: "Delete Prompt",
      action: "delete-history",
      payload: historyId,
      trigger
    });
  }

  function deleteHistoryItem(historyId) {
    state.history = state.history.filter(
      (item) => item.id !== historyId
    );

    persistHistory();
    renderHistory();
    showToast("Prompt removed from history.", "success");
  }

  function isValidHistoryItem(item) {
    return Boolean(
      item &&
        typeof item.id === "string" &&
        typeof item.prompt === "string" &&
        typeof item.createdAt === "string"
    );
  }

  /* ==========================================================================
     MODAL
     ========================================================================== */

  function openConfirmationModal({
    title,
    message,
    confirmLabel,
    action,
    payload = null,
    trigger = null
  }) {
    state.modalAction = action;
    state.modalPayload = payload;
    state.modalTrigger = trigger || document.activeElement;

    dom.modalTitle.textContent = title;
    dom.modalMessage.textContent = message;
    dom.modalConfirmButton.textContent = confirmLabel;
    dom.modal.hidden = false;

    document.body.classList.add("modal-open");

    window.setTimeout(() => {
      dom.modalCancelButton.focus();
    }, 0);
  }

  function closeConfirmationModal() {
    dom.modal.hidden = true;
    document.body.classList.remove("modal-open");

    const trigger = state.modalTrigger;

    state.modalAction = null;
    state.modalPayload = null;
    state.modalTrigger = null;

    trigger?.focus?.();
  }

  function executeModalAction() {
    const action = state.modalAction;
    const payload = state.modalPayload;

    closeConfirmationModal();

    switch (action) {
      case "clear-all":
        clearAll();
        break;

      case "clear-category":
        clearCategory(payload);
        break;

      case "delete-history":
        deleteHistoryItem(payload);
        break;

      default:
        break;
    }
  }

  function trapModalFocus(event) {
    if (dom.modal.hidden || event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      dom.modal.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null);

    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ==========================================================================
     TOASTS
     ========================================================================== */

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const text = document.createElement("p");
    text.className = "toast__message";
    text.textContent = message;

    toast.append(text);
    dom.toastRegion.append(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");

      window.setTimeout(() => {
        toast.remove();
      }, 250);
    }, TOAST_DURATION);
  }

  /* ==========================================================================
     GENERAL DOM HELPERS
     ========================================================================== */

  function getControlByKey(key) {
    return document.querySelector(
      `input[data-key="${escapeSelectorValue(
        key
      )}"], select[data-key="${escapeSelectorValue(
        key
      )}"], textarea[data-key="${escapeSelectorValue(key)}"]`
    );
  }

  function getChipFieldByKey(key) {
    return document.querySelector(
      `.chip-field[data-key="${escapeSelectorValue(key)}"]`
    );
  }

  function getCategoryCard(category) {
    return document.querySelector(
      `.category-card[data-category="${escapeSelectorValue(category)}"]`
    );
  }

  function setControlValue(control, value) {
    if (!control) {
      return;
    }

    control.value = value ?? "";
    clearControlError(control);
  }

  function isCharacterCategoryActive() {
    const card = document.querySelector(
      '[data-conditional-category="character"]'
    );

    return Boolean(
      card &&
        !card.classList.contains("is-hidden") &&
        card.dataset.conditionalHidden !== "true"
    );
  }

  function isProductCategoryActive() {
    const card = document.querySelector(
      '[data-conditional-category="product"]'
    );

    return Boolean(
      card &&
        !card.classList.contains("is-hidden") &&
        card.dataset.conditionalHidden !== "true"
    );
  }

  function getCategoryDisplayName(category) {
    const names = {
      inspiration: "Inspiration",
      creationType: "Creation Type",
      character: "Character Design",
      product: "Product Design",
      style: "Style",
      environment: "Environment",
      colorLighting: "Color and Lighting",
      composition: "Composition",
      finish: "Finish and Quality",
      customGuidance: "Custom Guidance"
    };

    return names[category] || category || "Category";
  }

  function getFieldDisplayName(field) {
    const legend = field.querySelector("legend");
    return legend?.textContent?.trim() || field.dataset.key || "this group";
  }

  function escapeSelectorValue(value) {
    if (window.CSS?.escape) {
      return window.CSS.escape(String(value));
    }

    return String(value).replace(/["\\]/g, "\\$&");
  }

  /* ==========================================================================
     TEXT AND ARRAY UTILITIES
     ========================================================================== */

  function joinNatural(items) {
    const cleaned = deduplicateStrings(items);

    if (!cleaned.length) {
      return "";
    }

    if (cleaned.length === 1) {
      return cleaned[0];
    }

    if (cleaned.length === 2) {
      return `${cleaned[0]} and ${cleaned[1]}`;
    }

    return `${cleaned.slice(0, -1).join(", ")}, and ${
      cleaned[cleaned.length - 1]
    }`;
  }

  function deduplicateStrings(items) {
    const output = [];
    const seen = new Set();

    flattenValues(items).forEach((item) => {
      const text = String(item || "").trim();

      if (!text || text === "None") {
        return;
      }

      const normalized = normalizeText(text);

      if (!seen.has(normalized)) {
        seen.add(normalized);
        output.push(text);
      }
    });

    return output;
  }

  function flattenValues(items) {
    return items.flatMap((item) =>
      Array.isArray(item) ? flattenValues(item) : [item]
    );
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim();
  }

  function lowercaseFirst(value) {
    const text = String(value || "");
    return text ? text.charAt(0).toLowerCase() + text.slice(1) : "";
  }

  function quoted(value) {
    return value ? `“${cleanExactText(value)}”` : "";
  }

  function articleFor(value) {
    const text = String(value || "").trim().toLowerCase();
    return /^[aeiou]/.test(text) ? "an" : "a";
  }

  function normalizeSubjectCount(subjectCount) {
    const map = {
      One: "single",
      Two: "two-subject",
      Three: "three-subject",
      "Small Group": "small-group",
      "Coordinated Collection": "coordinated-collection"
    };

    return map[subjectCount] || "single";
  }

  function randomInteger(minimum, maximum) {
    return (
      Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
    );
  }

  function shuffleArray(array) {
    const copy = [...array];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = randomInteger(0, index);
      [copy[index], copy[randomIndex]] = [
        copy[randomIndex],
        copy[index]
      ];
    }

    return copy;
  }

  function createUniqueId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `prompt-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  function formatHistoryDate(isoDate) {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
      return "Recently generated";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function prefersReducedMotion() {
    return window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }
})();