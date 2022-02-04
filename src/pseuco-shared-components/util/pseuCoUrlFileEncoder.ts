import { PetriNetObject } from "@pseuco/colored-petri-nets/dist/coloredPetriNets";
import pako from "pako";
import { LTS } from "../lts/lts";

export type FileContent = string | PetriNetObject | LTS | null;

type RemoteFile = { // This type should be widespread in pseuco-shared-components, old type wrongfully only supported {content: string}
    type: string,
    content: FileContent,
    name?: string,
    temporary?: boolean
}

export const fileToUriFragment = (file: RemoteFile): string => {
    const fileJSON = JSON.stringify(file);

    const textEncoder = new TextEncoder();
    const uncompressed = textEncoder.encode(fileJSON);

    const compressed = pako.gzip(uncompressed);
    const base64String = btoa(String.fromCharCode(...compressed));

    return base64String.replaceAll("/", "-");
};

export const openFileInConcurrentProgrammingWeb = (file: RemoteFile): void => {
    const fragment = fileToUriFragment(file);
    location.href = `https://react.pseuco.com/#/edit/url/${fragment}`;
};

export const uriFragmentToFile = (fragment: string): RemoteFile | undefined => {
    fragment = fragment.replaceAll('-', '/');
    try {
        const compressedAsString = atob(fragment);

        const compressed = new Uint8Array(compressedAsString.length);
        for (let i = 0; i < compressedAsString.length; i++) compressed[i] = compressedAsString.charCodeAt(i);

        const uncompressed = pako.ungzip(compressed);

        const textDecoder = new TextDecoder();
        const fileJSON = textDecoder.decode(uncompressed);

        const file = JSON.parse(fileJSON) as RemoteFile;

        return file;
    } catch (error: unknown) {
        return undefined;
    }
};
