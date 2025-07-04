"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/components/page-title-context";
import { getGraphQLClient } from "@/lib/graphql-client";
import { useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Trash2, PlusIcon, Layers2Icon } from "lucide-react";
import { gql } from "graphql-request";
import { Data } from "@/types/data";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateDataForm = {
  text: string;
  label: string;
};

type CreateResponseForm = {
  label: string;
  responses: string[];
};

export default function TrainModelPage() {
  const { setTitle } = usePageTitle();
  const { data: session } = useSession();

  useEffect(() => {
    setTitle("Train Model");
    return () => setTitle("");
  }, [setTitle]);

  const graphQLClient = getGraphQLClient("/graphql/admin", session?.bearer);
  const endpoint = "/api/admin/train-model";

  const fetchData = async (): Promise<Data[]> => {
    const query = gql`
      query {
        getData {
          label
        }
      }
    `;

    const response = await graphQLClient.request<{ getData: Data[] }>(query);

    return response.getData;
  };

  const { data: labels, refetch } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchData,
  });

  const {
    register: registerData,
    handleSubmit: handleDataSubmit,
    reset: resetDataValue,
    formState: { errors: dataErrors, isSubmitting: isDataSubmitting },
  } = useForm<CreateDataForm>();

  const onDataSubmit: SubmitHandler<CreateDataForm> = async (data) => {
    try {
      const res = await axios.post(
        endpoint,
        {
          ...data,
          type: "data",
        },
        {
          headers: {
            Authorization: `Bearer ${session?.bearer}`,
          },
        }
      );

      resetDataValue();
      refetch();

      toast("Data added successfully", {
        description: res.data.message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error;
      }
      toast("Error occurred", {
        description: message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    }
  };

  const {
    register: registerResponse,
    handleSubmit: handleResponseSubmit,
    reset: resetResponseValue,
    setValue,
    trigger,
    formState: { errors: responseErrors, isSubmitting: isResponseSubmitting },
  } = useForm<CreateResponseForm>({
    defaultValues: {
      label: "",
      responses: [""],
    },
  });

  const [responses, setResponses] = useState<string[]>([""]);

  const handleAddResponse = () => setResponses((prev) => [...prev, ""]);
  const handleRemoveResponse = (idx: number) =>
    setResponses((prev) => prev.filter((_, i) => i !== idx));
  const handleChangeResponse = (idx: number, value: string) => {
    setResponses((prev) => prev.map((r, i) => (i === idx ? value : r)));
  };

  const onResponseSubmit: SubmitHandler<CreateResponseForm> = async (data) => {
    try {
      data.responses = responses;
      const res = await axios.post(
        endpoint,
        {
          ...data,
          type: "response",
        },
        {
          headers: {
            Authorization: `Bearer ${session?.bearer}`,
          },
        }
      );

      resetResponseValue();
      toast("Responses created successfully", {
        description: res.data.message,
        position: "top-right",
      });
    } catch (error) {
      console.error(error);
      toast("Error", {
        description: "Failed to create responses",
        position: "top-right",
      });
    }
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTrain = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/train", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message);

      toast("Model has been trained successfully", {
        description: message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      console.error(error);
      setMessage("Training failed.");
      toast("Model trained failed", {
        description: message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    registerResponse("label").onChange({ target: { value: selectedLabel } });
  });

  return (
    <section className="p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form onSubmit={handleDataSubmit(onDataSubmit)} className="mb-4">
          <div className="mb-4">
            <h6 className="mb-0 font-bold">Create Data</h6>
            <small>
              Data is a collection of text samples labeled with categories.
              These labeled samples are used to train and test the AI model so
              it can learn to recognize patterns in input text and predict the
              correct label or intent during real use.
            </small>
          </div>
          <div className="flex-cols items-center gap-2">
            <div className="w-full mb-4">
              <Input
                id="create-text"
                {...registerData("text", { required: "Text is required" })}
                placeholder="Text..."
                className="mb-2"
              />
              {dataErrors.text && (
                <p className="text-red-600 text-sm">
                  {dataErrors.text.message}
                </p>
              )}
            </div>
            <div className="w-full mb-4">
              <Input
                id="create-text"
                {...registerData("label", { required: "Label is required" })}
                placeholder="Label..."
                className="mb-2"
              />
              {dataErrors.label && (
                <p className="text-red-600 text-sm">
                  {dataErrors.label.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isDataSubmitting}>
              {isDataSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save Data"
              )}
            </Button>
          </div>
        </form>

        <form onSubmit={handleResponseSubmit(onResponseSubmit)}>
          <div className="mb-4">
            <h6 className="mb-0 font-bold">Create Responses</h6>
            <small>
              A collection of predefined answers or phrases that your AI uses to
              reply to user inputs. Each response is linked to a label (intent)
              that your trained model predicts, so the chatbot knows what to say
              for each matched intent.
            </small>
          </div>
          <div className="flex-cols items-center gap-2">
            <div className="mb-4 w-full">
              <Select
                value={selectedLabel}
                onValueChange={(value) => {
                  setSelectedLabel(value);
                  setValue("label", value, { shouldValidate: true });
                  trigger("label");
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select label" />
                </SelectTrigger>
                <SelectContent>
                  {labels?.map((item) => (
                    <SelectItem key={item.label} value={item.label}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {responseErrors.label && (
                <p className="text-red-600 text-sm">
                  {responseErrors.label.message}
                </p>
              )}
            </div>

            {responses.map((response, index) => (
              <div key={index} className="flex items-center mb-4 gap-2">
                <Input
                  value={response}
                  onChange={(e) => handleChangeResponse(index, e.target.value)}
                  placeholder="Response text..."
                  className="flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveResponse(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleAddResponse}>
                <PlusIcon />
              </Button>

              <Button type="submit" disabled={isResponseSubmitting}>
                {isResponseSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Responses"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
        <hr className="my-5"/>
      <div className="flex justify-center">
        <Button onClick={handleTrain} disabled={loading} className="w-70">
          <Layers2Icon />
          {loading ? "Training..." : "Train Model"}
        </Button>
      </div>
    </section>
  );
}
