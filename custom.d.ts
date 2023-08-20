/*declare module '*.svg' {
  const content: any
  export default content
}*/

declare module "*.svg" {
  import { ReactElement, SVGProps } from "react";
  const content: (props: SVGProps<SVGElement>) => ReactElement;
  export default content;
}


interface Window {
  chatbaseConfig?: any;
}


interface String {
    replaceAll(input: stering|RegExp, replace: any): any;
}

