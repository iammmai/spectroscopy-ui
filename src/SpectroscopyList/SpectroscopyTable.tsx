import {
  DataGrid,
  GridColDef,
  GridCellParams,
  GridRenderCellParams,
} from "@mui/x-data-grid";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";

import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";

import api from "api";
import { CircularProgress } from "@mui/material";

const SpectroscopyTable = ({ className }: { className: string }) => {
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery("spectroscopyList", async () => {
    const { data } = await api.get("/spectroscopy/list");
    return data;
  });

  let navigate = useNavigate();
  const handleCellClick = (params: GridCellParams) => {
    navigate(`/${params.id}`);
  };

  const deleteSpectroscopyMutation = useMutation(
    (data: { id: string }) => api.delete(`/spectroscopy/${data.id}`),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.invalidateQueries("spectroscopyList");
      },
    }
  );

  const handleDelete = (id: string) => (e: any) => {
    e.stopPropagation();
    console.log(id);
    deleteSpectroscopyMutation.mutate({ id });
  };

  const renderDelete = (params: GridRenderCellParams<any, any, any>) => {
    return (
      <IconButton onClick={handleDelete(params.id as string)}>
        <DeleteOutlineIcon />
      </IconButton>
    );
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", width: 230 },
    { field: "description", headerName: "Description", width: 230 },
    {
      field: "createdAt",
      headerName: "Created at",
      type: "date",
      width: 230,
    },
    {
      field: "updatedAt",
      headerName: "Updated at",
      type: "date",
      width: 260,
    },
    {
      headerName: "Actions",
      field: "actions",
      width: 100,
      renderCell: renderDelete,
    },
  ];

  const getRowId = (row: any) => {
    return row._id;
  };

  return (
    <DataGrid
      rows={data}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[5]}
      getRowId={getRowId}
      className={className}
      onCellClick={handleCellClick}
      autoHeight
    />
  );
};

export default SpectroscopyTable;
