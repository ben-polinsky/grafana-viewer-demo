/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ViewStateProps } from "@itwin/core-common";
import { EntityState, IModelConnection, Viewport, ViewState } from "@itwin/core-frontend";

const hardcodedViewJSON = {
  "viewDefinitionProps": {
    "classFullName": "BisCore:SpatialViewDefinition",
    "jsonProperties": {
      "viewDetails": {}
    },
    "code": {
      "spec": "0x1",
      "scope": "0x1",
      "value": ""
    },
    "model": "0x10",
    "categorySelectorId": "0",
    "displayStyleId": "0",
    "cameraOn": true,
    "origin": [
      159.48723492698292,
      39.89985314824418,
      -66.72779920605284
    ],
    "extents": [
      188.89990775494311,
      141.52735276327425,
      122.11214683128718
    ],
    "angles": {
      "pitch": -2.16228253198012,
      "roll": 87.15157003556537,
      "yaw": 179.89244025941787
    },
    "camera": {
      "lens": 75.60000000000245,
      "focusDist": 121.7641468312888,
      "eye": [
        60.62442121511019,
        154.8464768306549,
        10.020041492367014
      ]
    },
    "modelSelectorId": "0"
  },
  "categorySelectorProps": {
    "classFullName": "BisCore:CategorySelector",
    "code": {
      "spec": "0x1",
      "scope": "0x1",
      "value": ""
    },
    "model": "0x10",
    "categories": [
      "0x2000000001c",
      "0x20000000b02",
      "0x20000000b1a",
      "0x20000000b44",
      "0x20000000b46",
      "0x20000000b4a",
      "0x20000000b4c",
      "0x20000000b50",
      "0x20000000b56",
      "0x20000000b72",
      "0x20000000b74",
      "0x20000000b7a",
      "0x20000000b7c",
      "0x20000000b7e",
      "0x20000000b80",
      "0x20000000b86",
      "0x20000000b9a",
      "0x20000000b9e",
      "0x20000000ba2",
      "0x20000000ba6",
      "0x20000000bae",
      "0x20000000bb2",
      "0x20000000bb8",
      "0x20000000bbc",
      "0x20000000bca",
      "0x20000000bdc",
      "0x20000000be0",
      "0x20000000bf0",
      "0x20000000bf2",
      "0x20000000bf6",
      "0x20000000c00",
      "0x20000000c02",
      "0x20000000c06",
      "0x20000000c10",
      "0x20000000c1e",
      "0x20000000c4c",
      "0x20000000c68",
      "0x20000000c6a",
      "0x20000000c76",
      "0x20000000c8e",
      "0x20000000c90",
      "0x20000000c96",
      "0x20000000c9e",
      "0x20000000cba",
      "0x20000000cc0",
      "0x20000000cca",
      "0x20000000cf8",
      "0x20000000cfa",
      "0x20000000d06",
      "0x20000000d0c",
      "0x20000000d0e",
      "0x20000000d12",
      "0x20000000d18",
      "0x20000000d2a",
      "0x20000000d54",
      "0x20000000d58",
      "0x20000000da4",
      "0x20000000db2",
      "0x20000000de8",
      "0x20000000dee",
      "0x20000000dfc",
      "0x20000000dfe",
      "0x20000000e04",
      "0x20000000e06",
      "0x20000000e08",
      "0x20000000e0a",
      "0x20000000e0c",
      "0x20000000e14",
      "0x20000000e16",
      "0x20000000e1a",
      "0x20000000e1c",
      "0x20000000e1e",
      "0x20000000e20",
      "0x20000000e22",
      "0x20000000e2a",
      "0x20000000e88",
      "0x20000000f54",
      "0x20000000f56",
      "0x50000000419",
      "0x5000000041b",
      "0x6000000000a",
      "0x70000000009",
      "0x70000000426",
      "0x7000000042a",
      "0x8000000043a",
      "0x8000000043c",
      "0x9000000041c",
      "0xa000000000b",
      "0xb0000000009",
      "0xb0000000010",
      "0xb0000000012",
      "0xb0000000014",
      "0xb0000000016",
      "0xb0000000018",
      "0xb000000001a",
      "0xb000000001c",
      "0xb000000001e",
      "0xb0000000020",
      "0xb0000000022",
      "0xb0000000024",
      "0xb0000000026",
      "0xb0000000028",
      "0xb000000002a",
      "0xb000000002e"
    ]
  },
  "displayStyleProps": {
    "classFullName": "BisCore:DisplayStyle",
    "jsonProperties": {
      "styles": {
        "viewflags": {
          "noConstruct": true,
          "clipVol": true,
          "renderMode": 6
        },
        "environment": {
          "sky": {
            "display": true,
            "twoColor": true,
            "groundColor": 15265008,
            "zenithColor": 16773854,
            "nadirColor": 15265008,
            "skyColor": 16773854
          },
          "ground": {
            "display": false,
            "elevation": -0.01,
            "aboveColor": 25600,
            "belowColor": 2179941
          }
        },
        "mapImagery": {
          "backgroundBase": {
            "name": "Bing Maps: Aerial Imagery with labels",
            "visible": true,
            "transparentBackground": false,
            "url": "https://dev.virtualearth.net/REST/v1/Imagery/Metadata/AerialWithLabels?o=json&incl=ImageryProviders&key={bingKey}",
            "formatId": "BingMaps"
          }
        },
        "contextRealityModels": []
      }
    },
    "code": {
      "spec": "0x1",
      "scope": "0x1",
      "value": ""
    },
    "model": "0x10"
  },
  "modelSelectorProps": {
    "classFullName": "BisCore:ModelSelector",
    "code": {
      "spec": "0x1",
      "scope": "0x1",
      "value": ""
    },
    "model": "0x10",
    "models": [
      "0x20000000044",
      "0x20000000f59",
      "0x20000000f5d",
      "0x20000000f61",
      "0x20000000f63",
      "0x20000000f67",
      "0x20000000f69",
      "0x40000000011",
      "0x4000000041e",
      "0x40000000420",
      "0x40000000422",
      "0x40000000424",
      "0x5000000000e",
      "0x50000000424",
      "0x6000000000f",
      "0x6000000041c",
      "0x6000000041e",
      "0x7000000000e",
      "0x7000000042f",
      "0x80000000014",
      "0x8000000043f",
      "0x80000000441",
      "0x80000000443",
      "0x80000000445",
      "0x80000000447",
      "0x80000000449",
      "0x8000000044b",
      "0x90000000010",
      "0x9000000041f",
      "0x90000000421",
      "0x90000000423",
      "0xa0000000010",
      "0xa0000000446",
      "0xa0000000448",
      "0xa000000044a"
    ]
  }
}



export default class SerializeViewApi {

  static serializeCurrentViewState(viewport: Viewport): ViewStateProps {
    /** Create a deep copy of the view and save its properties */
    const clonedView = viewport.view.clone();

    /** returns a serialized ViewState as a set of properties */
    return clonedView.toProps();
  }

  static async deserializeViewState(imodel: IModelConnection, props: ViewStateProps): Promise<ViewState | undefined> {
    /** Grab the type of imodel to reconstruct the view */
    const ctor = await imodel.findClassFor<typeof EntityState>(props.viewDefinitionProps.classFullName, undefined) as typeof ViewState | undefined;
    const viewState = ctor?.createFromProps(props, imodel);

    if (undefined !== viewState) {
      /** Load any data from the backend into the viewState */
      await viewState.load();
      /** Recreate the saved view from the properties json object */
      return viewState;
    }
    return undefined;
  }

  static async loadViewState(viewport: Viewport) {
    const view = await this.deserializeViewState(viewport.iModel, hardcodedViewJSON);
    if (undefined !== view) {
      /** Load the saved view */
      viewport.changeView(view, { animateFrustumChange: true });
    }
  }
}
