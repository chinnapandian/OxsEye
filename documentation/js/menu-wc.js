'use strict';


customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Application documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                        <li class="link">
                            <a href="contributing.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CONTRIBUTING
                            </a>
                        </li>
                        <li class="link">
                            <a href="license.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>LICENSE
                            </a>
                        </li>
                        <li class="link">
                            <a href="todo.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>TODO
                            </a>
                        </li>
                        <li class="link">
                            <a href="dependencies.html" data-type="chapter-link">
                                <span class="icon ion-ios-list"></span>Dependencies
                            </a>
                        </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse" ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link">AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' : 'data-target="#xs-components-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' :
                                            'id="xs-components-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CaptureComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">CaptureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImageGalleryComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ImageGalleryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImageSlideComponent.html"
                                                    data-type="entity-link" data-context="sub-entity" data-context-id="modules">ImageSlideComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' : 'data-target="#xs-injectables-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' :
                                        'id="xs-injectables-links-module-AppModule-6febe808bb6e517dd46115a2b9fc3617"' }>
                                        <li class="link">
                                            <a href="injectables/OxsEyeLogger.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>OxsEyeLogger</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TransformedImageProvider.html"
                                                data-type="entity-link" data-context="sub-entity" data-context-id="modules" }>TransformedImageProvider</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link">AppRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/CaptureComponent.html" data-type="entity-link">CaptureComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CaptureComponent-1.html" data-type="entity-link">CaptureComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogContent.html" data-type="entity-link">DialogContent</a>
                            </li>
                            <li class="link">
                                <a href="components/DialogContent-1.html" data-type="entity-link">DialogContent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImageGalleryComponent.html" data-type="entity-link">ImageGalleryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImageGalleryComponent-1.html" data-type="entity-link">ImageGalleryComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImageSlideComponent.html" data-type="entity-link">ImageSlideComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ImageSlideComponent-1.html" data-type="entity-link">ImageSlideComponent</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/ActivityLoader.html" data-type="entity-link">ActivityLoader</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/OxsEyeLogger.html" data-type="entity-link">OxsEyeLogger</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OxsEyeLogger-1.html" data-type="entity-link">OxsEyeLogger</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransformedImage.html" data-type="entity-link">TransformedImage</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransformedImageProvider.html" data-type="entity-link">TransformedImageProvider</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransformedImageProvider-1.html" data-type="entity-link">TransformedImageProvider</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse" ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});