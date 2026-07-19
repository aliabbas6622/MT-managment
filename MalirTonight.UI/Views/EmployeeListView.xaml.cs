using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class EmployeeListView : System.Windows.Controls.UserControl
{
    public EmployeeListView()
    {
        InitializeComponent();
    }

    public EmployeeListView(EmployeeListViewModel viewModel) : this()
    {
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadEmployeesCommand.ExecuteAsync(null);
    }
}