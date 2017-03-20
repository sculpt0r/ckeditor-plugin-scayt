/*
Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.dialog.add( 'scaytDialog', function( editor ) {
	var scayt_instance =  editor.scayt;

	var aboutTabDefinition = '<p><img src="' + scayt_instance.getLogo() + '" /></p>' +
				'<p>' + scayt_instance.getLocal('version') + scayt_instance.getVersion() + '</p>' +
				'<p>' + scayt_instance.getLocal('text_copyrights') + '</p>';

	var doc = CKEDITOR.document;

	var optionGenerator = function() {
		var scayt_instance_ = editor.scayt,
			applicationConfig = scayt_instance.getApplicationConfig(),
			optionArrayUiCheckboxes = [],
			optionLocalizationList = {
				"ignore-all-caps-words" 		: "label_allCaps",
				"ignore-domain-names" 			: "label_ignoreDomainNames",
				"ignore-words-with-mixed-cases" : "label_mixedCase",
				"ignore-words-with-numbers" 	: "label_mixedWithDigits"
			};

		for(var option in applicationConfig) {

			var checkboxConfig = {
				type: "checkbox"
			};

			checkboxConfig.id  = option;
			checkboxConfig.label  = scayt_instance.getLocal(optionLocalizationList[option]);

			optionArrayUiCheckboxes.push(checkboxConfig);
		}

		return optionArrayUiCheckboxes;
	};

	var languageModelState = {
		isChanged : function() {
			return (this.newLang === null || this.currentLang === this.newLang) ? false : true;
		},
		currentLang: scayt_instance.getLang(),
		newLang: null,
		reset: function() {
			this.currentLang = scayt_instance.getLang();
			this.newLang = null;
		},
		id: 'lang'
	};

	var generateDialogTabs = function(tabsList, editor) {
		var tabs = [],
			uiTabs = editor.config.scayt_uiTabs;

		if(!uiTabs) {
			return tabsList;
		} else {
			for(var i in uiTabs) {
				(uiTabs[i] == 1) && tabs.push(tabsList[i]);
			}

			tabs.push(tabsList[tabsList.length - 1]);
		}

		return tabs;
	};

	var dialogTabs = [{
		id : 'options',
		label : scayt_instance.getLocal('tab_options'),
		onShow: function() {
			// console.log("tab show");
		},
		elements : [
			{
				type: 'vbox',
				id: 'scaytOptions',
				children: optionGenerator(),
				onShow: function() {
					var optionsTab = this.getChild(),
						scayt_instance =  editor.scayt;
					for(var i = 0; i < this.getChild().length; i++) {
						this.getChild()[i].setValue(scayt_instance.getApplicationConfig()[this.getChild()[i].id]);
					}

				}
			}

		]
	},
	{
		id : 'langs',
		label : scayt_instance.getLocal('tab_languages'),
		elements : [
			{
				id: "leftLangColumn",
				type: 'vbox',
				align: 'left',
				widths: ['100'],
				children: [
					{
						type: 'html',
						id: 'langBox',
						style: 'overflow: hidden; white-space: normal;margin-bottom:15px;',
						html: '<div><div style="float:left;width:45%;margin-left:5px;" id="left-col-' + editor.name + '" class="scayt-lang-list"></div><div style="float:left;width:45%;margin-left:15px;" id="right-col-' + editor.name + '" class="scayt-lang-list"></div></div>',
						onShow: function() {
							var scayt_instance =  editor.scayt;
							var lang = scayt_instance.getLang(),
								prefix_id = "scaytLang_",
								radio = doc.getById(prefix_id + editor.name + '_' + lang);

							radio.$.checked = true;
						}
					},
					{
						type: 'html',
						id: 'graytLanguagesHint',
						html: '<div style="margin:5px auto; width:95%;white-space:normal;" id="' + editor.name + 'graytLanguagesHint"><span style="width:10px;height:10px;display: inline-block; background:#02b620;vertical-align:top;margin-top:2px;"></span> - This languages are supported by Grammar As You Type(GRAYT).</div>',
						onShow: function() {
							var graytLanguagesHint = doc.getById(editor.name + 'graytLanguagesHint');

							if (!editor.config.grayt_autoStartup) {
								graytLanguagesHint.$.style.display = 'none';
							}
						}
					}
				]
			}
		]
	},
	{
		id : 'dictionaries',
		label : scayt_instance.getLocal('tab_dictionaries'),
		elements : [
			{
				type: 'vbox',
				id: 'rightCol_col__left',
				children: [
					{
						type: 'html',
						id: 'dictionaryNote',
						html: ''
					},
					{
						type: 'text',
						id: 'dictionaryName',
						label: scayt_instance.getLocal('label_fieldNameDic') || 'Dictionary name',
						onShow: function(data) {
							var dialog = data.sender,
								scayt_instance = editor.scayt;

							// IE7 specific fix
							setTimeout(function() {
								// clear dictionaryNote field
								dialog.getContentElement("dictionaries", "dictionaryNote").getElement().setText('');

								// restore/clear dictionaryName field
								if(scayt_instance.getUserDictionaryName() != null && scayt_instance.getUserDictionaryName() != '') {
									dialog.getContentElement("dictionaries", "dictionaryName").setValue(scayt_instance.getUserDictionaryName());
								}
							}, 0);
						}
					},
					{
						type: 'hbox',
						id: 'udButtonsHolder',
						align: 'left',
						widths: ['auto'],
						style: 'width:auto;',
						children: [
							{
								type: 'button',
								id: 'createDic',
								label: scayt_instance.getLocal('btn_createDic'),
								title: scayt_instance.getLocal('btn_createDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										self = dialogDefinition,
										scayt_instance = editor.scayt,
										name = dialog.getContentElement("dictionaries", "dictionaryName").getValue();

									scayt_instance.createUserDictionary(name, function(response) {
										if(!response.error) {
											self.toggleDictionaryState.call(dialog, 'dictionaryState');
										}
										response.dialog = dialog;
										response.command = "create";
										response.name = name;
										editor.fire("scaytUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "create";
										error.name = name;
										editor.fire("scaytUserDictionaryActionError", error);
									});
								}
							},
							{
								type: 'button',
								id: 'restoreDic',
								label: scayt_instance.getLocal('btn_restoreDic'),
								title: scayt_instance.getLocal('btn_restoreDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										scayt_instance = editor.scayt,
										self = dialogDefinition,
										name = dialog.getContentElement("dictionaries", "dictionaryName").getValue();

									scayt_instance.restoreUserDictionary(name, function(response) {
										response.dialog = dialog;
										if(!response.error) {
											self.toggleDictionaryState.call(dialog, 'dictionaryState');
										}
										response.command = "restore";
										response.name = name;
										editor.fire("scaytUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "restore";
										error.name = name;
										editor.fire("scaytUserDictionaryActionError", error);
									});
								}
							},
							{
								type: 'button',
								id: 'disconnectDic',
								label: 'Disconnect',
								title: 'Disconnect',
								onClick: function() {
									var dialog = this.getDialog(),
										scayt_instance = editor.scayt,
										self = dialogDefinition,
										dictionaryNameField = dialog.getContentElement("dictionaries", "dictionaryName"),
										name = dictionaryNameField.getValue();

									scayt_instance.disconnectFromUserDictionary({});
									
									dictionaryNameField.setValue('');
									self.toggleDictionaryState.call(dialog, 'initialState');
									
									editor.fire("scaytUserDictionaryAction", {
										dialog: dialog,
										command: 'disconnect',
										name: name
									});
								}
							},
							{
								type: 'button',
								id: 'removeDic',
								label: scayt_instance.getLocal('btn_deleteDic'),
								title: scayt_instance.getLocal('btn_deleteDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										scayt_instance = editor.scayt,
										self = dialogDefinition,
										dictionaryNameField = dialog.getContentElement("dictionaries", "dictionaryName"),
										name = dictionaryNameField.getValue();

									scayt_instance.removeUserDictionary(name, function(response) {
										dictionaryNameField.setValue("");
										if(!response.error) {
											self.toggleDictionaryState.call(dialog, 'initialState');
										}
										response.dialog = dialog;
										response.command = "remove";
										response.name = name;
										editor.fire("scaytUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "remove";
										error.name = name;
										editor.fire("scaytUserDictionaryActionError", error);
									});
								}
							},
							{
								type: 'button',
								id: 'renameDic',
								label: scayt_instance.getLocal('btn_renameDic'),
								title: scayt_instance.getLocal('btn_renameDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										scayt_instance = editor.scayt,
										name = dialog.getContentElement("dictionaries", "dictionaryName").getValue();

									scayt_instance.renameUserDictionary(name, function(response) {
										response.dialog = dialog;
										response.command = "rename";
										response.name = name;
										editor.fire("scaytUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "rename";
										error.name = name;
										editor.fire("scaytUserDictionaryActionError", error);
									});
								}
							},
							{
								type: 'button',
								id: 'editDic',
								label: 'Edit',
								title: 'Edit',
								onLoad: function() {
									var dialog = this.getDialog(),
										scayt_instance = editor.scayt;
								},
								onClick: function() {
									var dialog = this.getDialog(),
										scayt_instance = editor.scayt,
										addWordField = dialog.getContentElement('dictionaries', 'addWordField');

									dialogDefinition.clearWordList.call(dialog);
									addWordField.setValue('');
									
									scayt_instance.getUserDictionary('', function(response) {
										if(!response.error) {
											dialogDefinition.renderItemList.call(dialog, response.wordlist);
										}
									});
									
									dialogDefinition.toggleDictionaryState.call(dialog, 'wordsState');
								}
							}
						]
					},
					{
						type: 'hbox',
						id: 'dicInfo',
						align: 'left',
						style: 'width:auto;',
						children: [
							{
								type: 'html',
								id: 'dicInfoHtml',
								html: '<div id="dic_info_editor1" style="margin:5px auto; width:95%;white-space:normal;">' + scayt_instance.getLocal('text_descriptionDic')  + '</div>'
							}
						]
					},
					{
						id: 'workWithWords',
						type: 'hbox',
						style: 'width: 100%; height: 210px; margin-bottom: 0',
						children: [
							{
								type: 'scaytItemList',
								id: 'itemList',
								align: 'left',
								style: 'width: 100%; height: 210px;',
								onClick: function(data) {
									var event = data.data.$,
										dataAttributeName = 'data-cke-scayt-ud-word',
										UILib = SCAYT.prototype.UILib,
										parent = UILib.parent(event.target)[0],
										word = UILib.attr(parent, dataAttributeName),
										dialog = this.getDialog(),
										itemList = dialog.getContentElement('dictionaries', 'itemList');
									
									if ( UILib.hasClass(event.target, 'cke_scaytItemList_remove') ) {
										scayt_instance.deleteWordFromUserDictionary(word, function(response) {
											if (!response.error) {
												itemList.removeChild(parent, word);
											}
											
											response.dialog = dialog;
											response.command = "deleteWord";
											response.name = word;
											editor.fire("scaytUserDictionaryAction", response);
										}, function(error) {
											error.dialog = dialog;
											error.command = "deleteWord";
											error.name = word;
											editor.fire("scaytUserDictionaryActionError", error);
										});
									}
								}
							},
							{
								id: 'wordActions',
								type: 'vbox',
								style: 'width: 100%; min-width: 150px;',
								children: [
									{
										type: 'text',
										id: 'addWordField',
										label: 'Add word'
									},
									{
										type: 'hbox',
										id: 'addWordButton',
										align: 'left',
										widths: ['auto'],
										style: 'width:auto;',
										children: [
											{
												type: 'button',
												id: 'addWord',
												label: 'Add word',
												title: 'Add word',
												onClick: function() {
													var dialog = this.getDialog(),
														scayt_instance = editor.scayt,
														itemList = dialog.getContentElement("dictionaries", "itemList"),
														addWordField = dialog.getContentElement('dictionaries', 'addWordField'),
														word = addWordField.getValue(),
														self = this;

													if (!word) {
														return;
													}
													
													if ( itemList.inChildren(word) ) {
														addWordField.setValue('');
														
														editor.fire("scaytUserDictionaryAction", {
															dialog: dialog,
															command: 'wordAlreadyAdded',
															name: word
														});
														
														return;
													}
													
													this.disable();
													
													scayt_instance.addWordToUserDictionary(word, function(response) {
														if (!response.error) {
															addWordField.setValue('');
															itemList.addChild(word, true);
														}
														
														response.dialog = dialog;
														response.command = "addWord";
														response.name = word;
														
														self.enable();
														editor.fire("scaytUserDictionaryAction", response);
													}, function(error) {
														error.dialog = dialog;
														error.command = "addWord";
														error.name = word;
														
														self.enable();
														editor.fire("scaytUserDictionaryActionError", error);
													});
												}
											}
										]
									},
									{
										type: 'hbox',
										id: 'dictionaryState',
										children: [
											{
												type: 'button',
												id: 'backToDic',
												label: 'Back',
												title: 'Back',
												onClick: function() {
													var dialog = this.getDialog(),
														scayt_instance = editor.scayt;
									
									
													if (scayt_instance.getUserDictionaryName() != null && scayt_instance.getUserDictionaryName() != '') {
														dialogDefinition.toggleDictionaryState.call(dialog, 'dictionaryState');
													} else {
														dialogDefinition.toggleDictionaryState.call(dialog, 'initialState');
													}
												}
											}
										]
									}
								]
							}
						]
					}
				]
			}
		]
	},
	{
		id : 'about',
		label : scayt_instance.getLocal('tab_about'),
		elements : [
			{
				type : 'html',
				id : 'about',
				style : 'margin: 5px 5px;',
				html : '<div><div id="scayt_about_">' +
						aboutTabDefinition +
						'</div></div>'
			}
		]
	}];

	editor.on("scaytUserDictionaryAction", function(event) {
		var UILib = SCAYT.prototype.UILib,
			dialog = event.data.dialog,
			dictionaryNote = dialog.getContentElement("dictionaries", "dictionaryNote").getElement(),
			scayt_instance =  event.editor.scayt,
			messageTemplate;

		if(event.data.error === undefined) {

			// success message
			messageTemplate = scayt_instance.getLocal("message_success_" + event.data.command + "Dic");
			messageTemplate = messageTemplate.replace('%s', event.data.name);
			dictionaryNote.setText(messageTemplate);
			UILib.css(dictionaryNote.$, {color: 'blue'});
		} else {

			// error message
			if(event.data.name === '') {

				// empty dictionary name
				dictionaryNote.setText(scayt_instance.getLocal('message_info_emptyDic'));
			} else {
				messageTemplate = scayt_instance.getLocal("message_error_" + event.data.command + "Dic");
				messageTemplate = messageTemplate.replace('%s', event.data.name);
				dictionaryNote.setText(messageTemplate);
			}
			UILib.css(dictionaryNote.$, {color: 'red'});

			if(scayt_instance.getUserDictionaryName() != null && scayt_instance.getUserDictionaryName() != '') {
				dialog.getContentElement("dictionaries", "dictionaryName").setValue(scayt_instance.getUserDictionaryName());
			} else {
				dialog.getContentElement("dictionaries", "dictionaryName").setValue("");
			}
		}
	});

	editor.on("scaytUserDictionaryActionError", function(event) {
		var UILib = SCAYT.prototype.UILib,
			dialog = event.data.dialog,
			dictionaryNote = dialog.getContentElement("dictionaries", "dictionaryNote").getElement(),
			scayt_instance =  event.editor.scayt,
			messageTemplate;

		if(event.data.name === '') {

			// empty dictionary name
			dictionaryNote.setText(scayt_instance.getLocal('message_info_emptyDic'));
		} else {
			messageTemplate = scayt_instance.getLocal("message_error_" + event.data.command + "Dic");
			messageTemplate = messageTemplate.replace('%s', event.data.name);
			dictionaryNote.setText(messageTemplate);
		}
		UILib.css(dictionaryNote.$, {color: 'red'});


		if(scayt_instance.getUserDictionaryName() != null && scayt_instance.getUserDictionaryName() != '') {
			dialog.getContentElement("dictionaries", "dictionaryName").setValue(scayt_instance.getUserDictionaryName());
		} else {
			dialog.getContentElement("dictionaries", "dictionaryName").setValue("");
		}

	});

	var plugin = CKEDITOR.plugins.scayt;

	var dialogDefinition = {
		title:          scayt_instance.getLocal('text_title'),
		resizable:      CKEDITOR.DIALOG_RESIZE_BOTH,
		minWidth: 		( CKEDITOR.skinName || editor.config.skin ) == 'moono-lisa' ? 450 : 340,
		minHeight: 		260,
		onLoad: function() {
			if(editor.config.scayt_uiTabs[1] == 0) {
				return;
			}

			var dialog = this,
				self = dialogDefinition,
				langBoxes = self.getLangBoxes.call(dialog);

			langBoxes.getParent().setStyle("white-space", "normal");

			//dialog.data = editor.fire( 'scaytDialog', {} );
			self.renderLangList(langBoxes);

			var scayt_instance = editor.scayt;

			this.definition.minWidth = this.getSize().width;
			this.resize(this.definition.minWidth, this.definition.minHeight);
			
			this.on('selectPage', function (data) {
				if (data.data.page === 'dictionaries') {
					if (scayt_instance.getUserDictionaryName() != null && scayt_instance.getUserDictionaryName() != '') {
						dialogDefinition.toggleDictionaryState.call(dialog, 'dictionaryState');
					} else {
						dialogDefinition.toggleDictionaryState.call(dialog, 'initialState');
					}
				}
			});
		},
		onCancel: function() {
			languageModelState.reset();
		},
		onHide: function() {
			editor.unlockSelection();
		},
		onShow: function() {
			editor.fire("scaytDialogShown", this);

			if(editor.config.scayt_uiTabs[2] == 0) {
				return;
			}

			var scayt_instance = editor.scayt,
				self = dialogDefinition,
				dialog = this,
				dictionaryNameField = dialog.getContentElement("dictionaries", "dictionaryName");
			
			if(scayt_instance.getUserDictionaryName() != null && scayt_instance.getUserDictionaryName() != '') {
				dialog.getContentElement("dictionaries", "dictionaryName").setValue(scayt_instance.getUserDictionaryName());
				self.toggleDictionaryState.call(this, 'dictionaryState');
			} else {
				dictionaryNameField.setValue("");
				self.toggleDictionaryState.call(this, 'initialState');
			}
		},
		onOk: function() {
			var dialog = this,
				self = dialogDefinition,
				scayt_instance =  editor.scayt,
				scaytOptions = dialog.getContentElement("options", "scaytOptions"),
				changedOptions = self.getChangedOption.call(dialog);

			scayt_instance.commitOption({ changedOptions: changedOptions });
		},
		toggleDictionaryButtons: function(exist) {
			var existance = this.getContentElement("dictionaries", "existDic").getElement().getParent(),
				notExistance = this.getContentElement("dictionaries", "notExistDic").getElement().getParent();

			if(exist) {
				existance.show();
				notExistance.hide();
			} else {
				existance.hide();
				notExistance.show();
			}

		},
		getChangedOption: function() {
			var changedOption = {};

			if(editor.config.scayt_uiTabs[0] == 1) {
				var dialog = this,
					scaytOptions = dialog.getContentElement("options", "scaytOptions").getChild();

				for(var i = 0; i < scaytOptions.length; i++) {
					if(scaytOptions[i].isChanged()) {
						changedOption[scaytOptions[i].id] = scaytOptions[i].getValue();
					}
				}
			}

			if(languageModelState.isChanged()) {
				changedOption[languageModelState.id] = editor.config.scayt_sLang = languageModelState.currentLang = languageModelState.newLang;
			}

			return changedOption;
		},
		buildRadioInputs: function(key, value, isSupportedByGrayt) {
			var divContainer = new CKEDITOR.dom.element( 'div' ),
				doc = CKEDITOR.document,
				id = "scaytLang_" + editor.name + '_' + value,
				radio = CKEDITOR.dom.element.createFromHtml( '<input id="' +
					id + '" type="radio" ' +
					' value="' + value + '" name="scayt_lang" />' ),

				radioLabel = new CKEDITOR.dom.element( 'label' ),
				scayt_instance = editor.scayt;

			divContainer.setStyles({
				"white-space": "normal",
				'position': 'relative',
				'padding-bottom': '2px'
			});

			radio.on( 'click', function(data) {
				languageModelState.newLang = data.sender.getValue();
			});

			radioLabel.appendText(key);
			radioLabel.setAttribute("for", id);

			if(isSupportedByGrayt && editor.config.grayt_autoStartup) {
				radioLabel.setStyles({
					'color': '#02b620'
				});
			}

			divContainer.append(radio);
			divContainer.append(radioLabel);

			if(value === scayt_instance.getLang()) {
				radio.setAttribute("checked", true);
				radio.setAttribute('defaultChecked', 'defaultChecked');
			}

			return divContainer;
		},
		renderLangList: function(langBoxes) {
			var dialog = this,
				leftCol = langBoxes.find('#left-col-' + editor.name).getItem(0),
				rightCol = langBoxes.find('#right-col-' + editor.name).getItem(0),
				scaytLangList = scayt_instance.getScaytLangList(),
				graytLangList = scayt_instance.getGraytLangList(),
				mergedLangList = {},
				sortable = [],
				counter = 0,
				isSupportedByGrayt = false,
				half, lang;

			for(lang in scaytLangList.ltr) {
				mergedLangList[lang] = scaytLangList.ltr[lang];
			}

			for(lang in scaytLangList.rtl) {
				mergedLangList[lang] = scaytLangList.rtl[lang];
			}

			// sort alphabetically lang list
			for(lang in mergedLangList) {
				sortable.push([lang, mergedLangList[lang]]);
			}
			sortable.sort(function(a, b) {
				var result = 0;
				if(a[1] > b[1]) {
					result = 1;
				} else if(a[1] < b[1]) {
					result = -1;
				}
				return result;
			});
			mergedLangList = {};
			for(var i = 0; i < sortable.length; i++) {
				mergedLangList[sortable[i][0]] = sortable[i][1];
			}

			half = Math.round(sortable.length / 2);

			for(lang in mergedLangList) {
				counter++;
				isSupportedByGrayt = (lang in graytLangList.ltr) || (lang in graytLangList.rtl);
				dialog.buildRadioInputs(mergedLangList[lang], lang, isSupportedByGrayt).appendTo(counter <= half ? leftCol : rightCol);
			}
		},
		getLangBoxes: function() {
			var dialog = this,
				langboxes = dialog.getContentElement("langs", "langBox").getElement();

			return langboxes;
		},
		toggleDictionaryState: function(state) {
			var dictionaryNameField = this.getContentElement('dictionaries', 'dictionaryName').getElement().getParent(),
				udButtonsHolder = this.getContentElement('dictionaries', 'udButtonsHolder').getElement().getParent(),
				btnCreate = this.getContentElement('dictionaries', 'createDic').getElement().getParent(),
				btnRestore = this.getContentElement('dictionaries', 'restoreDic').getElement().getParent(),
				btnDisconnect = this.getContentElement('dictionaries', 'disconnectDic').getElement().getParent(),
				btnRemove = this.getContentElement('dictionaries', 'removeDic').getElement().getParent(),
				btnRename = this.getContentElement('dictionaries', 'renameDic').getElement().getParent(),
				dicInfo = this.getContentElement('dictionaries', 'dicInfo').getElement().getParent(),
				workWithWords = this.getContentElement('dictionaries', 'workWithWords').getElement().getParent();

			
			switch (state) {
				case 'initialState':
					dictionaryNameField.show();
					udButtonsHolder.show();
					btnCreate.show();
					btnRestore.show();
					btnDisconnect.hide();
					btnRemove.hide();
					btnRename.hide();
					dicInfo.show();
					workWithWords.hide();
					break;
				case 'wordsState':
					dictionaryNameField.hide();
					udButtonsHolder.hide();
					dicInfo.hide();
					workWithWords.show();
					break;
				case 'dictionaryState':
					dictionaryNameField.show();
					udButtonsHolder.show();
					btnCreate.hide();
					btnRestore.hide();
					btnDisconnect.show();
					btnRemove.show();
					btnRename.show();
					dicInfo.hide();
					workWithWords.hide();
					break;
			}	
		},
		clearWordList: function() {
			var itemList = this.getContentElement("dictionaries", "itemList");
			
			itemList.removeAllChild();
		},
		renderItemList: function(words) {
			var itemList = this.getContentElement('dictionaries', 'itemList');
			
			for (var i = 0; i < words.length; i++) {
				itemList.addChild(words[i]);
			}
		},
		contents: generateDialogTabs(dialogTabs, editor)
	};

	return dialogDefinition;
});

CKEDITOR.tools.extend(CKEDITOR.ui.dialog, {
	scaytItemList: function(dialog, elementDefinition, htmlList) {
		if (!arguments.length) {
			return;
		}
		
		var me = this;

		dialog.on('load', function() {
			var element = me.getElement();
			
			element.on('click', function(e) {
				
			});
		});
		
		var innerHTML = function() {
			var html = ['<p class="cke_dialog_ui_', elementDefinition.type, '"'];
			
			if (elementDefinition.style) {
				html.push( 'style="' + elementDefinition.style + '" ' );
			}

			html.push('>');
			
			html.push('</p>');
			
			return html.join('');
		};
		
		CKEDITOR.ui.dialog.uiElement.call(this, dialog, elementDefinition, htmlList, '', null, null, innerHTML);
	}
});

CKEDITOR.ui.dialog.scaytItemList.prototype = CKEDITOR.tools.extend(new CKEDITOR.ui.dialog.uiElement(), {
	children: [],
	addChild: function(definition, start) {
		var p = new CKEDITOR.dom.element('p'),
			i = new CKEDITOR.dom.element('i'),
			child = this.getElement().getChildren().getItem(0);
		
		this.children.push(definition);
		
		p.addClass('cke_scaytItemList-child');
		p.setAttribute('data-cke-scayt-ud-word', definition);
		p.appendText(definition);
		
		i.addClass('cke_scaytItemList_remove');
		
		p.append(i);

		child.append(p, start ? true : false);
	},
	inChildren: function(word) {
		return SCAYT.prototype.Utils.inArray(this.children, word);
	},
	removeChild: function(child, word) {
		this.children.splice( SCAYT.prototype.Utils.indexOf(this.children, word), 1 );
		this.getElement().getChildren().getItem(0).$.removeChild(child);
	},
	removeAllChild: function() {
		this.children = [];
		this.getElement().getChildren().getItem(0).setHtml('');
	}
});

(function() {
	commonBuilder = {
		build: function(dialog, elementDefinition, output) {
			return new CKEDITOR.ui.dialog[elementDefinition.type](dialog, elementDefinition, output);
		}
	}
	
	CKEDITOR.dialog.addUIElement('scaytItemList', commonBuilder);
})();