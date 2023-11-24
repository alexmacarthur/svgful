import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LoadingIcon from "./LoadingIcon";
import DownloadIcon from "./DownloadIcon";
import { sendEvent } from "../utils";
import BeakerIcon from "./BeakerIcon";
import { API_HOST } from "../constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Converter() {
  const [format, setFormat] = useState("");
  const [fileName, setFileName] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [disabledInput, setDisabledInput] = useState<"" | "file" | "svgText">(
    "",
  );
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const file = formData.get("file") as File;

    if (!format) {
      return setError("Please select a format.");
    }

    if (!(!file || file.size) && !formData.get("svgText")) {
      return setError("Please upload a file or paste some SVG code.");
    }

    setError("");
    setIsConverting(true);
    sendEvent("convert_image", {
      format,
      source: formData.get("svgText") ? "text" : "file",
    });

    try {
      const response = await fetch(`${API_HOST}/convert`, {
        method: "POST",
        body: formData,
      });

      const imageBuffer = await response.arrayBuffer();
      const blob = new Blob([imageBuffer], { type: `image/${format}` });

      setDownloadUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError("Oh no! Something went wrong. Please try again.");
    } finally {
      setIsConverting(false);
    }
  }

  if (downloadUrl) {
    return (
      <div className="text-center">
        <h4 className="text-3xl mt-3 mb-6 font-normal">You're all set!</h4>

        <Button variant="outline" size={"lg"} asChild>
          <a
            href={downloadUrl}
            download={`converted-image.${format}`}
            className="button flex gap-2 items-center"
          >
            <DownloadIcon />

            <span>Download Image</span>
          </a>
        </Button>

        <Button
          variant={"secondary"}
          onClick={(e) => {
            e.preventDefault();
            setDownloadUrl("");
            setFileName("");
            setDisabledInput("");
            sendEvent("convert_another", {
              format,
            });
          }}
          className="button-as-link block text-center mx-auto mt-5"
        >
          Convert Another
        </Button>
      </div>
    );
  }

  if (isConverting) {
    return (
      <div className="text-center">
        <h4 className="text-xl mt-3 mb-4 font-normal">
          Give us a few seconds...
        </h4>
        <span className="block animate-spin w-20 h-20 mx-auto text-white">
          <LoadingIcon />
        </span>
      </div>
    );
  }

  const disabledClasses = "opacity-40 cursor-not-allowed";

  function fileIsDisabled() {
    return disabledInput === "file";
  }

  function textIsDisabled() {
    return disabledInput === "svgText";
  }

  return (
    <form onSubmit={handleSubmit as any} className="grid md:grid-cols-5 gap-10">
      <div className="md:col-span-3">
        <input type="hidden" name="format" value={format} />
        <input
          ref={fileRef}
          type="file"
          name="file"
          id="file"
          className="-z-10 opacity-0 absolute w-auto"
          accept={`image/svg+xml`}
          disabled={fileIsDisabled()}
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];

            if (!file) {
              return;
            }

            setDisabledInput("svgText");
            setFileName(file.name);
          }}
        />
        <div className="flex flex-col gap-8 items-center mb-8">
          <div className="flex-1 w-full">
            <h4 className="text-2xl mb-3">2) Upload/Paste an SVG</h4>

            <label className="mb-3 inline-block" htmlFor="file">
              Upload a file...
            </label>
            <div
              className={`flex flex-col sm:flex-row gap-2 relative ${
                fileIsDisabled() ? disabledClasses : ""
              }`}
            >
              <Button
                aria-label="Choose a File"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                type="button"
              >
                {fileName || "Choose a File"}
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="mb-3 inline-block" htmlFor="svgText">
              ...or paste the code.
            </label>
            <Textarea
              rows={10}
              onKeyPress={() => {
                setDisabledInput("file");
              }}
              onPaste={() => {
                setDisabledInput("file");
              }}
              onBlur={(e) => {
                setDisabledInput(
                  !(e.currentTarget as HTMLTextAreaElement).value ? "" : "file",
                );
              }}
              name="svgText"
              id="svgText"
              className={`${textIsDisabled() ? disabledClasses : ""}`}
              placeholder={'<svg width="100" height="100">...</svg>'}
            />
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <h4 className="text-2xl mb-3">1) Choose an Output Format</h4>
        <Select onValueChange={setFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Select an output format" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectGroup>
              {["webp", "jpeg", "png", "avif"].map((format) => {
                return (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex justify-center mt-6">
          <Button
            className="w-full disabled:pointer-events-none disabled:bg-none disabled:text-gray-700 disabled:border-2 disabled:border-solid disabled:border-gray-700 bg-white text-zinc-800"
            aria-label="Convert Image"
            id="submitButton"
          >
            <BeakerIcon />
            Convert Image
          </Button>
        </div>

        {error && (
          <span className="text-red-500 text-center block p-6 mt-0">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}

export default Converter;
