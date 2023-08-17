import * as React from 'react';
import { IAppraisalPortalProps } from './IAppraisalPortalProps';
import App from './App';

export default class AppraisalPortal extends React.Component<IAppraisalPortalProps, {}> {
  public render(): React.ReactElement<IAppraisalPortalProps> {
    const {
      description, 
      isDarkTheme,   
      environmentMessage, 
      hasTeamsContext,  
      userDisplayName, 
      Context,
    }=this.props;

    console.log(description, isDarkTheme, environmentMessage, hasTeamsContext, userDisplayName, Context);

    return (
      <App props={this.props}/>
    );
  }
}
