import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { PanelOptions } from 'common/types';
import { Viewer, } from '@itwin/web-viewer-react';
import { BrowserAuthorizationClient, BrowserAuthorizationCallbackHandler } from '@itwin/browser-authorization';
import "overrides.css"

import { IModelConnection,  StandardViewId, ScreenViewport, EmphasizeElements } from '@itwin/core-frontend';
import { ColorDef, FeatureOverrideType, FeatureAppearance } from '@itwin/core-common';
import { BasicNavigationWidget } from '@itwin/appui-react';
import SerializeViewApi from "./serializeViewApi"
import { default3DSandboxUi } from 'common/UiConfig';
const WrappedViewer = React.memo(Viewer, (oldProps, newProps) => true)


interface Props extends PanelProps<PanelOptions> {}

// eslint-disable-next-line react/display-name
export const Panel: React.FC<Props> = React.memo(({ options, data, width, height, replaceVariables }) => {

const green = ColorDef.fromString("rgba(29, 193, 29, 0.8)");
const orange  = ColorDef.fromString("rgba(255, 193, 29, 0.8)");
const lightGrey = ColorDef.fromString("rgba(245,245,245, .15)");

const [iModel, setIModel] = React.useState<IModelConnection>();
const [vp, setVp] = React.useState<ScreenViewport>();
const colorMap: Record<string, string[]> = {
  [ColorDef.red.toRgbaString()]: [],
  [ColorDef.blue.toRgbaString()]: [],
  [orange.toRgbaString()]: [],
  [green.toRgbaString()]: []
}

const queryVar = replaceVariables("$selected")

  useEffect(() => {
    console.log("New data received");
      if (vp && iModel && data.state === "Done")  {

       data.series.forEach(s => {
         const values = (s.fields?.find(f => f.name === 'avg')?.values as any)?.buffer
         
         if (!values) {return;}
         
         const max = Math.max(...values)
         
         if (max > 0) {
           let color;
           
           if (max > 125){
              console.log(`${s.name} is activated with a color of red`)
        
              color = ColorDef.red;
           } else if (max > 100) {
              console.log(`${s.name} is activated with a color of blue`)
       
              color = ColorDef.blue;
           } else if (max > 75) {
             console.log(`${s.name} is activated with a color of orange`)
           
             color = orange;
           } else {
             console.log(`${s.name} is activated with a color of green`)
             color = green;
           } 
   
           // find element id
           const idSeries = data.series.find(_s => _s.name && s.name !== _s.name && s.name?.includes(_s.name))
           console.log(idSeries)
           const id = (idSeries?.fields?.find(f => f.name === "elementId")?.values as any)?.buffer[0]
           console.log(`elementId is ${id}`)
           const colorIndex = color.toRgbaString();
                       
           if (!colorMap[colorIndex].includes(id)){
              colorMap[colorIndex].push(id)
           } // todo: remove elements from other color entries
             
          const provider = EmphasizeElements.getOrCreate(vp)
          provider.emphasizeElements(colorMap[colorIndex], vp);
     
     
          vp.iModel.selectionSet.add(id); // questionable here

          provider.emphasizeElements(colorMap[colorIndex], vp, FeatureAppearance.fromRgba(lightGrey));
          provider.overrideElements(colorMap[colorIndex], vp, color, FeatureOverrideType.ColorAndAlpha, true);  
        
        }
        // else could revert/decolorize element/area
  
       })
      }
  
    // calculate if any of the floors have people over > 100
    // if so... add the element and maybe zoom, we'll see...
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.series])
  
  
  // when a variable is changed
  useEffect(() => {
    // Fake element ids until we can get the merge tables working
    // or store data from the other series...
    if (!queryVar || !vp) {return;}
    
    const elementIds: Record<string, string> = {
      "Platform": "0x40000000453",
      "Street Level": "0x1e000000040b",
      "Traveler Space": "0x1e000000040c"
    }
    const queriedId = elementIds[queryVar]
    if (queriedId){
      vp.zoomToElements(queriedId, { animateFrustumChange: true, standardViewId: StandardViewId.Front }).then(res => {
        console.log("zoomewd")
      })
    }
      
  }, [queryVar, vp])

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
    if (window.location.search.includes('code')) {
      BrowserAuthorizationCallbackHandler.handleSigninCallback(options.redirectUrl).then().catch(console.error);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authClient]);

  useEffect(() => {
    void login();
  }, [login]);
  
  const onIModelConnected = useCallback(async (iModel: IModelConnection) => {
    console.log('On connected: ');
    setIModel(iModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.series]);
  
  const onViewPortLoaded = useCallback(async (viewport: ScreenViewport) => {
    console.log('On Viewport Loaded: ');
    await SerializeViewApi.loadViewState(viewport)
    setVp(viewport);
    viewport.view.viewFlags = viewport.viewFlags.with("backgroundMap", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.series]);



  if (Object.values(options).some(v => v === undefined)) {
    return <div>
      <p>Please set all panel options.</p>
    </div>
  } else if (token) {
    return <><WrappedViewer
      authClient={authClient}
      iTwinId={options.iTwinId}
      iModelId={options.iModelId}
      enablePerformanceMonitors={true}
      onIModelConnected={onIModelConnected}
      viewCreatorOptions={{viewportConfigurer: async (vp: ScreenViewport) => {onViewPortLoaded(vp)}}}
      mapLayerOptions={{BingMaps: {key: "key", value: "AtaeI3QDNG7Bpv1L53cSfDBgBKXIgLq3q-xmn_Y2UyzvF-68rdVxwAuje49syGZt"}}}
      defaultUiConfig={default3DSandboxUi}
    />
    {iModel && <BasicNavigationWidget />}
    </>
  } else {
    return <p>Logging in..</p>
  }
});
