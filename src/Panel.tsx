import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from 'common/types';
import {
  Viewer,
  ViewerStatusbarItemsProvider,
  ViewerContentToolsProvider,
  ViewerNavigationToolsProvider,
} from '@itwin/web-viewer-react';
import { BrowserAuthorizationClient } from '@itwin/browser-authorization';
import 'overrides.css';

import {
  ClipPlane,
  ClipPrimitive,
  ClipVector,
  ConvexClipPlaneSet,
  Plane3dByOriginAndUnitNormal,
  Point3d,
  Vector3d,
} from '@itwin/core-geometry';
import {
  IModelApp,
  IModelConnection,
  StandardViewId,
  StandardViewTool,
  ScreenViewport,
  EmphasizeElements,
  FitViewTool,
} from '@itwin/core-frontend';
import { Presentation } from '@itwin/presentation-frontend';
import { ColorDef, FeatureOverrideType, FeatureAppearance, QueryRowFormat } from '@itwin/core-common';
//import { BasicNavigationWidget } from '@itwin/appui-react';
import SerializeViewApi from './serializeViewApi';
import { MeasureTools, MeasureToolsUiItemsProvider } from '@itwin/measure-tools-react';
import { PropertyGridManager, PropertyGridUiItemsProvider } from '@itwin/property-grid-react';
import { TreeWidget, TreeWidgetUiItemsProvider } from '@itwin/tree-widget-react';
const WrappedViewer = React.memo(Viewer, (oldProps, newProps) => true);
/* eslint-disable */

interface Props extends PanelProps<PanelOptions> {}
interface Story {
  name: string;
  description: string;
  levelNumber: number;
  bottomElevation: number;
  topElevation: number;
}

// eslint-disable-next-line react/display-name
export const Panel: React.FC<Props> = React.memo(({ options, data, width, height, replaceVariables }) => {
  const green = ColorDef.fromString('rgba(29, 193, 29, 0.8)');
  const orange = ColorDef.fromString('rgba(255, 193, 29, 0.8)');
  const lightGrey = ColorDef.fromString('rgba(245,245,245, .15)');

  const [iModel, setIModel] = React.useState<IModelConnection>();
  const [vp, setVp] = React.useState<ScreenViewport>();
  const colorMap: Record<string, string[]> = {
    [ColorDef.red.toRgbaString()]: [],
    [ColorDef.blue.toRgbaString()]: [],
    [orange.toRgbaString()]: [],
    [green.toRgbaString()]: [],
  };

  const queryVar = replaceVariables('$selected');

  useEffect(() => {
    console.log('New data received');
    if (vp && iModel && data.state === 'Done') {
      data.series.forEach((s) => {
        const values = (s.fields?.find((f) => f.name === 'avg')?.values as any)?.buffer;

        if (!values) {
          return;
        }

        const max = Math.max(...values);

        if (max > 0) {
          let color;

          if (max > 125) {
            console.log(`${s.name} is activated with a color of red`);

            color = ColorDef.red;
          } else if (max > 100) {
            console.log(`${s.name} is activated with a color of blue`);

            color = ColorDef.blue;
          } else if (max > 75) {
            console.log(`${s.name} is activated with a color of orange`);

            color = orange;
          } else {
            console.log(`${s.name} is activated with a color of green`);
            color = green;
          }

          // find element id
          const idSeries = data.series.find((_s) => _s.name && s.name !== _s.name && s.name?.includes(_s.name));
          console.log(idSeries);
          const id = (idSeries?.fields?.find((f) => f.name === 'elementId')?.values as any)?.buffer[0];
          console.log(`elementId is ${id}`);
          const colorIndex = color.toRgbaString();

          if (!colorMap[colorIndex].includes(id)) {
            colorMap[colorIndex].push(id);
          } // todo: remove elements from other color entries

          const provider = EmphasizeElements.getOrCreate(vp);
          provider.emphasizeElements(colorMap[colorIndex], vp);

          vp.iModel.selectionSet.add(id); // questionable here

          provider.emphasizeElements(colorMap[colorIndex], vp, FeatureAppearance.fromRgba(lightGrey));
          provider.overrideElements(colorMap[colorIndex], vp, color, FeatureOverrideType.ColorAndAlpha, true);
        }
        // else could revert/decolorize element/area
      });
    }

    // calculate if any of the floors have people over > 100
    // if so... add the element and maybe zoom, we'll see...

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.series, vp, iModel, data.state, green, orange, lightGrey]);

  // when a variable is changed
  useEffect(() => {
    const refocus = async () => {
      // Fake element ids until we can get the merge tables working
      // or store data from the other series...
      if (!queryVar || !vp) return;

      // const elementIds: Record<string, string> = {
      //   "Platform": "0x40000000453",
      //   "Street Level": "0x1e000000040b",
      //   "Traveler Space": "0x1e000000040c"
      // }

      const floors: Record<string, number> = {
        Platform: 0,
        'Street Level': 3,
        'Traveler Space': 1,
      };

      //const queriedId = elementIds[queryVar];
      const floor = floors[queryVar];
      //if (queriedId){
      if (floor !== undefined) {
        const stories = await getLevels(vp.iModel);
        await changeViewForModel(stories[floor]);
      } else {
        vp.view.setViewClip();
      }

      //        vp.iModel.selectionSet.replace(queriedId);
      //        vp.zoomToElements(queriedId, { animateFrustumChange: true, standardViewId: StandardViewId.Iso }).then(res => {
      //          console.log("zoomewd")
      //        })
      //}
    };
    refocus().catch(console.error);
  }, [queryVar, vp]);

  const changeViewForModel = async (level: Story) => {
    const vp = IModelApp.viewManager.selectedView!;
    if (!vp) return;

    const imodel = vp.iModel;
    const viewState = vp.view;

    const planeSet = ConvexClipPlaneSet.createEmpty();
    createPlane(planeSet, level.bottomElevation, false);
    createPlane(planeSet, level.topElevation, true);

    const prim = ClipPrimitive.createCapture(planeSet);
    const clip = ClipVector.createEmpty();
    clip.appendReference(prim);
    viewState.viewFlags = viewState.viewFlags.with('clipVolume', true);
    viewState.setViewClip(clip);

    //viewState.viewFlags = viewState.viewFlags.with("backgroundMap", true);

    // Wait for all the asynchronous stuff before we start changing the viewport.
    // Otherwise we might see some of the changes before they are all applied.
    const categoryIds = await getCategoriesToTurnOff(imodel);

    vp.applyViewState(viewState);
    //vp.changeCategoryDisplay(categoryIds, false);

    // Need a way to re-render the scene
    vp.invalidateDecorations();
    requestAnimationFrame(() => {});
  };

  const createPlane = (planeSet: ConvexClipPlaneSet, z: number, top: boolean) => {
    const topPlaneOffset = -1.0;
    const botPlaneOffset = -1.0;
    const normal = Vector3d.create(0, 0, top ? -1.0 : 1.0);
    const origin = Point3d.create(0, 0, top ? z + topPlaneOffset : z + botPlaneOffset);

    const plane = Plane3dByOriginAndUnitNormal.create(origin, normal);
    if (undefined === plane) return;

    planeSet.addPlaneToConvexSet(ClipPlane.createPlane(plane));
  };

  const getCategoriesToTurnOff = async (imodel: IModelConnection) => {
    const categoryNames = [
      'FILL_Mesh',
      'SM_Mesh',
      'CL_Mesh',
      'SP-SM_Mesh',
      'GP_Mesh',
      'S-PILE-CONC',
      'li_building_footprints',
      'e_terrain_exterior',
      'completestreets',
      'A-SITE',
      'A-SITE-EARTH',
      'a-flor-otln',
      'neighborhoods_philadelphia',
      'GP',
      'boreholes_interpretation',
      'boreholes_interpretation_decoration',
      'boreholes',
      'Boreholes_Interpretation_Decoration',
      'CL',
      'IoTDeviceSpatialCategory',
      'A-Reserved Retail Area',
      'A-Reserved Retail Area',
      'SM',
      'boreholes_decoration',
      'SP-SM',
      'FILL',
    ];

    let query = `SELECT ECInstanceId, UserLabel FROM bis.category WHERE`;
    categoryNames.forEach((catName, index) => {
      if (0 !== index) query += ` or`;
      query += ` codeValue = '${catName}'`;
    });

    const rows = [];
    for await (const row of imodel.query(query)) rows.push(row);

    return rows.map((row) => {
      return row[0];
    });
  };

  const getLevels = async (imodel: IModelConnection): Promise<Story[]> => {
    const query = `select distinct Round(LEVEL_ELEV, 5) as LEVEL_ELEV, DATUM_TEXT from RevitDynamic.level ORDER BY LEVEL_ELEV`;
    const rows = [];
    try {
      let i = 0;
      for await (const row of imodel.query(query, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames }))
        rows.push({ name: row.dATUM_TEXT, levelNumber: i++, description: row.dATUM_TEXT, LEVEL_ELEV: row.lEVEL_ELEV });
    } catch (error) {
      console.error(error);
    }

    const stories: Story[] = [];
    rows.forEach((row, index, allRows) => {
      let bottomElev: number;
      if (index === allRows.length - 1) {
        bottomElev = Number.MAX_SAFE_INTEGER;
      } else bottomElev = allRows[index + 1].LEVEL_ELEV;

      if (index === 0) {
        stories.push({
          name: 'B1-PLATFORM',
          levelNumber: allRows.length + 1,
          description: 'below bottom',
          bottomElevation: Number.MIN_SAFE_INTEGER,
          topElevation: row.LEVEL_ELEV - 4.3,
        });
      }

      stories.push({
        name: row.name,
        levelNumber: allRows.length - row.levelNumber,
        description: row.description,
        bottomElevation: row.LEVEL_ELEV,
        topElevation: bottomElev,
      });
    });

    return stories;
  };

  const [token, setToken] = useState<string>('');

  const authClient = useMemo(
    () =>
      new BrowserAuthorizationClient({
        clientId: options.clientId,
        scope: options.scope,
        redirectUri: options.redirectUrl,
        postSignoutRedirectUri: '',
        responseType: 'code',
        authority: 'https://ims.bentley.com',
      }),
    [options.clientId, options.scope, options.redirectUrl]
  );

  const login = useCallback(async () => {
    if (window.location.search.includes('code') && options.redirectUrl) {
      authClient.handleSigninCallback().then().catch(console.error);
    } else {
      if (token) {
        return;
      }
      await authClient.signIn();
      try {
        const t = await authClient.getAccessToken();
        setToken(t);
      } catch (error) {
        console.error(`issue getting current token will attempt sign in: ${error} `);
      }
    }
  }, [authClient, token, options.redirectUrl]);

  useEffect(() => {
    void login();
  }, [login]);

  const onIModelConnected = useCallback(async (iModel: IModelConnection) => {
    console.log('On connected: ');
    setIModel(iModel);
  }, []);

  const onViewPortLoaded = useCallback(async (viewport: ScreenViewport) => {
    console.log('On Viewport Loaded: ');
    await SerializeViewApi.loadViewState(viewport);
    setVp(viewport);
    //viewport.view.viewFlags = viewport.viewFlags.with("backgroundMap", true);
    IModelApp.tools.run(StandardViewTool.toolId, vp, StandardViewId.RightIso);
    IModelApp.tools.run(FitViewTool.toolId, viewport, true, false);

    Presentation.selection.setSyncWithIModelToolSelection(viewport.iModel, true);
  }, []);

  const onIModelAppInit = useCallback(async () => {
    await TreeWidget.initialize();
    await PropertyGridManager.initialize();
    await MeasureTools.startup();
  }, []);

  if (Object.values(options).some((v) => v === undefined)) {
    return (
      <div>
        <p>Please set all panel options.</p>
      </div>
    );
  } else if (token) {
    return (
      <>
        <WrappedViewer
          authClient={authClient}
          iTwinId={options.iTwinId}
          iModelId={options.iModelId}
          enablePerformanceMonitors={true}
          onIModelConnected={onIModelConnected}
          onIModelAppInit={onIModelAppInit}
          viewCreatorOptions={{
            viewportConfigurer: async (vp: ScreenViewport) => {
              onViewPortLoaded(vp);
            },
          }}
          //mapLayerOptions={{BingMaps: {key: "key", value: "AtaeI3QDNG7Bpv1L53cSfDBgBKXIgLq3q-xmn_Y2UyzvF-68rdVxwAuje49syGZt"}}}
          uiProviders={[
            new ViewerNavigationToolsProvider(),
            new ViewerContentToolsProvider({
              vertical: {
                measureGroup: false,
              },
            }),
            new ViewerStatusbarItemsProvider(),
            new TreeWidgetUiItemsProvider(),
            new PropertyGridUiItemsProvider({
              enableCopyingPropertyText: true,
            }),
            new MeasureToolsUiItemsProvider(),
          ]}
        />
      </>
    );
  } else {
    return <p>Logging in..</p>;
  }
});
