import React, { useEffect, useState } from "react";
import FlatList from "flatlist-react";
import { useIngredients } from "../context/ingredientsContext";
import IngredientCard from "../components/IngredientCard";
import Input from "../components/Input";
import { IoIosCloseCircleOutline } from "react-icons/io";
import SidebarPage from "../components/SidebarPage";
import Button from "../components/Button";
import { Modal } from "@mui/material";
import { AiOutlineCloseCircle } from "react-icons/ai";
import Dropdown from "../components/Dropdown";
import SelectedIngredientCard from "../components/SelectedIngredientCard";
import api from "../services/api";
import { IoSearchOutline } from "react-icons/io5";
import { useAuth } from "../context/authContext";
import Swal from "sweetalert2";

interface SelectedIngredientsProps {
  name: string;
  id: string;
}

interface CheckedIngredientsProps {
  id: string;
}

const Ingredients: React.FC = () => {
  const { ingredients } = useIngredients();
  const { handleSetIngredients } = useIngredients();
  const [openModal, setOpenModal] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [visible, setVisible] = useState(false);
  const [checkeds, setCheckeds] = useState<CheckedIngredientsProps[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredientsProps[]
  >([]);

  const { getToken } = useAuth();

  const getIngredients = async () => {
    try {
      const token = await getToken();
      const response = await api.get("/api/v1/user/ingredient", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        handleSetIngredients(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteIngredients = async () => {
    try {
      const token = await getToken();
      const response = await api.delete("/api/v1/user/ingredient/", {
        data: checkeds,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response) {
        console.log(response);
        setCheckeds([]);
        Swal.fire({
          title: "Deletado!",
          text: "Seus ingredientes foram deletados com sucesso.",
          icon: "success",
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Erro!",
        text: "Ocorreu um erro ao deletar os ingredientes.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleConfirmDelete = () => {
    Swal.fire({
      title: "Você tem certeza?",
      text: "Esta ação não pode ser revertida!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, deletar!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteIngredients();
      }
    });
  };

  const submitAddedIngredients = async () => {
    try {
      const token = await getToken();
      const response = await api.post(
        "/api/v1/user/ingredient",
        selectedIngredients,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response) {
        getIngredients();
        setOpenModal(false);
        setSelectedIngredients([]);
        Swal.fire({
          title: "Sucesso!",
          text: "Ingredientes adicionados com sucesso.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Erro!",
        text: "Ocorreu um erro ao adicionar os ingredientes.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  
  const sortedIngredients: any = ingredients.sort((a, b) =>
    a.descrip.localeCompare(b.descrip)
  );

  const handleRemoveSelectedIngredient = (id: string) => {
    const filter = selectedIngredients.filter((item) => item.id !== id);

    setSelectedIngredients(filter);
  };

  const handleAddSelectedIngredient = (name: string, id: string) => {
    const isAlreadyAdded = selectedIngredients.some(item => item.id === id);
    if (!isAlreadyAdded) {
      const newItem: SelectedIngredientsProps = {
        name: name,
        id: id,
      };
      setSelectedIngredients((prev) => [...prev, newItem]);
    }
  };
  
  const blank = () => (
    <div className="flex justify-center">
      {" "}
      <h1 className="text-sm- text-subtitle">A lista está vazia</h1>
    </div>
  );

  const closeModal = () => {
    setOpenModal(false);
  };

  const handleIngredientCheck = (data: { checked: boolean; id: string }) => {
    const { checked, id } = data;

    if (checked === true) {
      setCheckeds((prev) => [...prev, { id: id }]);
    } else {
      setCheckeds((prev) => prev.filter((item) => item.id !== id));
    }
  };

  useEffect(() => {
    getIngredients()
    setVisible(checkeds.length > 0);
  }, [checkeds]);


  return (
    <>
      <div>
        <Modal
          style={{
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "center",
            justifySelf: "center",
          }}
          open={openModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description">
          <div className="w-[70vw] h-[90vh] bg-white rounded-[4px] py-[20px] px-[40px]">
            <div className="flex justify-between items-center mb-[40px]">
              <h1 className="text-md text-title font-semibold ">
                Selecione os itens que deseja adicionar à sua lista
              </h1>
              <AiOutlineCloseCircle
                size={30}
                className="cursor-pointer text-title"
                onClick={closeModal}
              />
            </div>
            <div className="flex justify-between">
              <Dropdown onClick={handleAddSelectedIngredient} />
              <div className="flex flex-col h-[60vh] w-[40%] overflow-hidden overflow-y-scroll no-scrollbar rounded-[4px] ">
                <FlatList
                  renderWhenEmpty={blank}
                  list={selectedIngredients}
                  renderOnScroll
                  renderItem={(item, index) => (
                    <div className="mb-5">
                      <SelectedIngredientCard
                        key={index}
                        name={item.name}
                        onClickRemove={() =>
                          handleRemoveSelectedIngredient(item.id)
                        }
                      />
                    </div>
                  )}
                />
              </div>
            </div>
            <div className=" w-full h-[44px] justify-end flex items-end mt-[30px]">
              <Button
                title="Salvar"
                width="w-[10%]"
                onClick={submitAddedIngredients}
              />
            </div>
          </div>
        </Modal>
      </div>
      <SidebarPage headerTitle="Ingredientes">
        <div className="flex flex-col w-full">
          <div className="h-[80vh] flex flex-col w-full pr-[100px] mt-[40px]">
            <Input
              value={filterText}
              onChange={(value) => setFilterText(value.target.value)}
              placeholder="Buscar..."
              firstIcon={<IoSearchOutline color="#667085" size={20} />}
              icon={
                <button onClick={() => setFilterText("")}>
                  <IoIosCloseCircleOutline color="#667085" size={20} />
                </button>
              }
            />
            <div className="flex justify-between items-center mt-[40px]">
              <h1 className="text-md text-subtitle self-end">Sua lista</h1>
              <div className="flex">
                {visible ? (
                  <Button
                    title="Remover"
                    width="w-[120px]"
                    marginBottom=""
                    backgroundColor="bg-remove"
                    onClick={() => {
                      handleConfirmDelete();
                      console.log(checkeds, "CHECKEDS");
                    }}
                  />
                ) : (
                  ""
                )}
                <Button
                  title="Adicionar"
                  width="w-[120px]"
                  marginBottom=""
                  marginLeft="ml-[40px]"
                  onClick={() => {
                    setOpenModal(true);
                  }}
                />
              </div>
            </div>
            <div className=" w-full h-[100%] mt-[20px] overflow-y-scroll">
              <FlatList
                list={ingredients}
                renderOnScroll
                sort
                renderWhenEmpty={blank}
                sortBy={sortedIngredients}
                renderItem={(item) => (
                  <IngredientCard
                    handleIngredientCheck={handleIngredientCheck}
                    key={item.id}
                    value={item.descrip}
                    id={item.id}
                  />
                )}
                filterBy={(item) =>
                  item.descrip.toLowerCase().startsWith(filterText)
                }
              />
            </div>
          </div>
        </div>
      </SidebarPage>
    </>
  );
};

export default Ingredients;
