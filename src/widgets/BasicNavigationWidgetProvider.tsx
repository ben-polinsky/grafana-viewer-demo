import React from 'react';
import { BasicNavigationWidget } from '@itwin/appui-react';
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";

export class BasicNavigationWidgetProvider implements UiItemsProvider {
    readonly id: string = "BasicNavigationWidgetProvider";
  
    provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): readonly AbstractWidgetProps[] {
      const widgets: AbstractWidgetProps[] = [];
      if (location === StagePanelLocation.Top && _section === StagePanelSection.Start) {
        widgets.push(
          {
            id: "BasicNavigationWidget",
            label: "BasicNavigationWidget",
            defaultState: WidgetState.Open,
            getWidgetContent: () => <BasicNavigationWidget/>,
          }
        );
      }
      return widgets;
    }
}
